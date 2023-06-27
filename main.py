import os
import pymysql
import time
import psutil

# from pdfminer.high_level import extract_text
from pdfminer.converter import TextConverter
from pdfminer.layout import LAParams
from pdfminer.pdfinterp import PDFResourceManager, PDFPageInterpreter
from pdfminer.pdfpage import PDFPage
from io import StringIO
import pdfminer
from docx import Document

# MySQL数据库连接信息
DB_HOST = 'localhost'
DB_USER = 'root'
DB_PASSWORD = ''
DB_NAME = 'fileindexer'

# 建立数据库连接
connection = pymysql.connect(host=DB_HOST, user=DB_USER, password=DB_PASSWORD, db=DB_NAME, charset='utf8mb4')
cursor = connection.cursor()

def index_files(folder_path):
    for root, dirs, files in os.walk(folder_path):
        for file in files:
            if file.endswith(('.pdf', '.docx')):
                file_type = "pdf" if file.endswith('.pdf') else "docx"
                file_name = str(file)
                file_path = os.path.join(root, file)
                file_content = extract_file_content(file_path)
                save_to_database(file_name, file_path, file_content,file_type)

def extract_file_content(file_path):
    # 解析文件内容的逻辑，可以使用相应的库（如PDF解析库和docx解析库）
    file_content = ''
    if file_path.endswith('.pdf'):
        file_content = extract_pdf_content(file_path)
    elif file_path.endswith('.docx'):
        file_content = extract_docx_content(file_path)
    return file_content

def extract_pdf_content(file_path):
    resource_manager = PDFResourceManager()
    output_string = StringIO()
    laparams = LAParams()
    device = TextConverter(resource_manager, output_string, laparams=laparams)
    interpreter = PDFPageInterpreter(resource_manager, device)

    with open(file_path, 'rb') as file:
        for page in PDFPage.get_pages(file):
            interpreter.process_page(page)

    text = output_string.getvalue()
    output_string.close()
    device.close()

    return text

def extract_docx_content(file_path):
    doc = Document(file_path)
    paragraphs = [p.text for p in doc.paragraphs]
    return '\n'.join(paragraphs)

def save_to_database(file_name,file_path, file_content, file_type):
    # 将文件路径和内容保存到数据库的逻辑，使用SQL插入语句
    query = "INSERT INTO file_index (file_name,file_path, content,file_type) VALUES (%s, %s, %s, %s)"
    cursor.execute(query, (file_name, file_path, file_content, file_type))
    connection.commit()

def search_files(keyword):
    query = "SELECT file_path FROM file_index WHERE content LIKE %s"
    cursor.execute(query, ('%' + keyword + '%'))
    search_results = cursor.fetchall()
    return search_results

# 其他功能函数（如保存查询结果到文本文件）

if __name__ == '__main__':
        # 记录开始时间
    start_time = time.time()
    
    folder_path = 'D:\\Desktop\\Program\\'
    index_files(folder_path)
    keyword = 'PointCloud'
    search_results = search_files(keyword)
    # 记录结束时间
    end_time = time.time()
    
    for file_path in search_results:
        print("Found file:", file_path)
        
    # 输出耗时和内存使用情况
    elapsed_time = end_time - start_time
    memory_usage = psutil.Process(os.getpid()).memory_info().rss / 1024 / 1024  # 单位为MB

    print("Elapsed time: %.2f seconds" % elapsed_time)
    print("Memory usage: %.2f MB" % memory_usage)
    
# 关闭数据库连接
cursor.close()
connection.close()
