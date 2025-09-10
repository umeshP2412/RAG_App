from typing import List, Dict, Any, Optional, Tuple, Union
import os
import logging
from langchain_community.document_loaders import (
    PyPDFLoader, 
    CSVLoader, 
    TextLoader,
    UnstructuredExcelLoader
)
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_community.vectorstores import Chroma
from langchain_openai import OpenAIEmbeddings
from langchain_openai import ChatOpenAI
from langchain.chains import ConversationalRetrievalChain
from langchain.schema import Document
from langchain.schema.messages import HumanMessage, AIMessage, SystemMessage
import pandas as pd

from app.core.config import settings

logger = logging.getLogger(__name__)

class RagService:
    def __init__(self):
        self.openai_api_key = settings.OPENAI_API_KEY
        self.embeddings = OpenAIEmbeddings(api_key=self.openai_api_key)
        self.persist_directory = settings.VECTOR_DB_PATH
        self.text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=1000,
            chunk_overlap=200
        )
        
        # Initialize LLM
        self.llm = ChatOpenAI(
            api_key=self.openai_api_key,
            model_name=settings.MODEL_NAME,
            temperature=0.2
        )
    
    def process_file(self, file_path: str, file_type: str) -> List[Document]:
        """Process a file and return documents"""
        try:
            if file_type.lower().endswith('pdf'):
                loader = PyPDFLoader(file_path)
            elif file_type.lower().endswith('csv'):
                loader = CSVLoader(file_path)
            elif file_type.lower().endswith('txt'):
                loader = TextLoader(file_path)
            elif file_type.lower().endswith(('xls', 'xlsx')):
                loader = UnstructuredExcelLoader(file_path)
            else:
                raise ValueError(f"Unsupported file type: {file_type}")
            
            documents = loader.load()
            logger.info(f"Loaded {len(documents)} documents from {file_path}")
            
            # Split documents
            split_docs = self.text_splitter.split_documents(documents)
            logger.info(f"Split into {len(split_docs)} chunks")
            
            return split_docs
        
        except Exception as e:
            logger.error(f"Error processing file {file_path}: {str(e)}")
            raise
    
    def create_or_update_vectorstore(self, documents: List[Document], collection_name: str) -> Chroma:
        """Create or update a vector store with documents"""
        try:
            # Check if collection exists
            vectorstore = Chroma(
                persist_directory=self.persist_directory,
                embedding_function=self.embeddings,
                collection_name=collection_name
            )
            
            # Add documents to the collection
            vectorstore.add_documents(documents)
            vectorstore.persist()
            
            logger.info(f"Updated vector store for collection {collection_name}")
            return vectorstore
            
        except Exception as e:
            logger.error(f"Error creating/updating vector store: {str(e)}")
            raise
    
    def get_vectorstore(self, collection_name: str) -> Optional[Chroma]:
        """Get a vector store by collection name"""
        try:
            vectorstore = Chroma(
                persist_directory=self.persist_directory,
                embedding_function=self.embeddings,
                collection_name=collection_name
            )
            return vectorstore
        except Exception as e:
            logger.error(f"Error getting vector store: {str(e)}")
            return None
    
    def query(self, 
              query: str, 
              collection_name: str, 
              chat_history: List[Dict[str, Any]],
              use_web_search: bool = False) -> Tuple[str, Optional[List[Dict[str, Any]]]]:
        """Query the RAG system"""
        try:
            # Format chat history for the model
            formatted_history = []
            for message in chat_history:
                if message["role"] == "user":
                    formatted_history.append(HumanMessage(content=message["content"]))
                elif message["role"] == "assistant":
                    formatted_history.append(AIMessage(content=message["content"]))
            
            # Get vector store
            vectorstore = self.get_vectorstore(collection_name)
            if not vectorstore:
                return "I don't have any documents to search through yet. Please upload some files first.", None
            
            # Create retriever
            retriever = vectorstore.as_retriever(
                search_type="similarity",
                search_kwargs={"k": 5}
            )
            
            # Create RAG chain
            qa_chain = ConversationalRetrievalChain.from_llm(
                llm=self.llm,
                retriever=retriever,
                return_source_documents=True,
                verbose=True
            )
            
            # Generate system message based on whether web search is enabled
            system_message = "You are a helpful assistant that answers questions based on the provided documents."
            if use_web_search:
                system_message += " You also have access to web search for up-to-date information."
            
            # Prepare the formatted history for the chain
            formatted_history_for_chain = []
            for i, msg in enumerate(formatted_history):
                if isinstance(msg, HumanMessage):
                    formatted_history_for_chain.append((msg.content, ""))
                    if i < len(formatted_history) - 1 and isinstance(formatted_history[i+1], AIMessage):
                        formatted_history_for_chain[-1] = (msg.content, formatted_history[i+1].content)
            
            # Execute the chain
            result = qa_chain(
                {"question": query, "chat_history": formatted_history_for_chain},
            )
            
            # Format sources
            sources = []
            if "source_documents" in result:
                for doc in result["source_documents"]:
                    source = {
                        "content": doc.page_content,
                        "metadata": doc.metadata
                    }
                    sources.append(source)
            
            return result["answer"], sources
            
        except Exception as e:
            logger.error(f"Error querying RAG system: {str(e)}")
            return f"Sorry, an error occurred while processing your query: {str(e)}", None
