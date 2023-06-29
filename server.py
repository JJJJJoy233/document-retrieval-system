import os
import re
import sqlite3
from docx import Document
from PyPDF2 import PdfFileReader
from flask import Flask, render_template, request, jsonify

app = Flask(__name__)

# 创建SQLite数据库
def create_database():
    conn = sqlite3.connect('index.db')
    c = conn.cursor()

    # 创建索引表
    c.execute('''
        CREATE TABLE IF NOT EXISTS file_index (
            file_path TEXT,
            line_number INTEGER,
            content TEXT
        )
    ''')
    c.execute('''
              DELETE FROM file_index
              ''')
    conn.commit()
    conn.close()


# 将指定文件夹下的PDF和Word文档建立索引并存储到数据库
def build_index(folder_path):
    conn = sqlite3.connect('index.db')
    c = conn.cursor()

    # 遍历文件夹中的所有文件
    for root, dirs, files in os.walk(folder_path):
        for file in files:
            file_path = os.path.join(root, file)

            # 处理PDF文件
            if file.endswith('.pdf'):
                pdf = PdfFileReader(open(file_path, 'rb'))
                total_pages = pdf.getNumPages()

                for page_number in range(total_pages):
                    page = pdf.getPage(page_number)
                    content = page.extract_text()
                    lines = content.split('\n')

                    # 遍历每一行文本
                    for line_number, line in enumerate(lines):
                        # 忽略空行和只包含空格的行
                        if line.strip():
                            # 插入索引到数据库
                            c.execute('INSERT INTO file_index VALUES (?, ?, ?)', (file_path, line_number, line))

            # 处理Word文档
            elif file.endswith('.docx'):
                doc = Document(file_path)

                # 遍历每个段落
                for paragraph_number, paragraph in enumerate(doc.paragraphs):
                    content = paragraph.text.strip()

                    # 忽略空段落
                    if content:
                        # 插入索引到数据库
                        c.execute('INSERT INTO file_index VALUES (?, ?, ?)', (file_path, paragraph_number, content))

    conn.commit()
    conn.close()


# 根据关键字搜索索引并返回匹配的结果
def search_index(keyword):
    conn = sqlite3.connect('index.db')
    c = conn.cursor()

    # 使用SQL查询匹配的索引
    c.execute('SELECT file_path, line_number, content FROM file_index WHERE content LIKE ?', ('%' + keyword + '%',))
    results = c.fetchall()

    # 构建结果列表
    search_results = []
    current_file = None
    current_lines = []
    
    for result in results:
        file_path, line_number, content = result
        # search_results.append({file_path: {line_number: content}})
        if current_file != file_path:
            if current_file:
                search_results.append({'file_path': current_file, 'lines': current_lines})
            current_file = file_path
            current_lines = [{'line_number': line_number, 'line_content': content}]
        else:
            current_lines.append({'line_number': line_number, 'line_content': content})

    if current_file:
        search_results.append({'file_path': current_file, 'lines': current_lines})

    conn.close()

    return search_results


@app.route('/', methods=['GET', 'POST'])
def index():
    if request.method == 'POST':
        keyword = request.form['keyword']
        drive = request.form['drive']
        folder = request.form['folder']
        build_index(folder)
        results = search_index(keyword)
        return (results, 200);
    else:
        drives = [{'drive': drive} for drive in get_drives()]
        return render_template('index.html', drives=drives)


def get_drives():
    drives = []
    for drive in range(ord('A'), ord('Z') + 1):
        drive_letter = chr(drive)
        drive_path = drive_letter + ":\\"
        if os.path.exists(drive_path):
            drives.append(drive_path)
    return drives

@app.route('/get_folders')
def get_folders():
    path = request.args.get('path')
    folders = [f.name for f in os.scandir(path) if f.is_dir()]
    return jsonify(folders)

@app.route('/search', methods=['POST'])
def search():
    keyword = request.form['keyword']
    folder = request.form['folder']
    # create_database()
    # build_index(folder)
    results = search_index(keyword)
    return jsonify(results)

# 有必要的话 选中文件夹时就索引
@app.route('/makeIndex', methods=['POST'])
def makeIndex():
    folder = request.form["folder"]
    create_database()
    build_index(folder)
    return jsonify({"success": 200})

if __name__ == '__main__':
    app.run(debug=True)
