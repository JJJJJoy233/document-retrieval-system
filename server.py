from flask import Flask, request, render_template, jsonify
import os
import zipfile

app = Flask(__name__)


@app.route('/', methods=['GET'])
def index():
    return render_template('index.html')

@app.route('/upload', methods=['POST'])
def upload():
    if 'file' not in request.files:
        return 'No file uploaded', 400

    file = request.files['file']
    if file.filename == '':
        return 'No file selected', 400

    if file:
        # 保存上传的压缩包文件
        file.save(file.filename)

        # 解压缩文件
        # with zipfile.ZipFile(file.filename, 'r') as zip_ref:
        #     zip_ref.extractall('uploads')

        # 处理解压缩后的文件

        # 删除上传的压缩包文件
        os.remove(file.filename)
        
        # return 'File uploaded and processed successfully', 200

    return 'Error uploading file', 500

@app.route('/search', methods=['GET'])
def search():
    keyword = request.args.get('keyword')
    # 对上传上来的文件进行索引和检索
    
    
    # 得到一个搜索结果列表
    data_list = [
            {'filename1': {"line_number1": 'content1', "line_number2": 'content2'}},
            {'filename2': {"line_number1": 'content1', "line_number2": 'content2'}},
            {'filename3': {"line_number1": 'content1', "line_number2": 'content2'}}
        ]
    return jsonify(data_list), 200
    

if __name__ == '__main__':
    app.run(port=8888,debug=True)
