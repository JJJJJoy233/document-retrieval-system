  // 用于渲染返回的数据
  function renderData(data) {
    const container = document.getElementById('data-container');
    data.forEach((item, index) => {
      const div = document.createElement('div');
      div.id = `data-item-${index}`;
      const checkbox = document.createElement('input');
      checkbox.setAttribute('type', 'checkbox');
      checkbox.id = `checkbox-${index}`;
      div.appendChild(checkbox);
      Object.keys(item).forEach(key => {
        const innerDiv = document.createElement('div');
        innerDiv.textContent = `${key}: ${JSON.stringify(item[key])}`;
        div.appendChild(innerDiv);
      });
      container.appendChild(div);
    });
    const downloadButton = document.createElement('button');
    downloadButton.id = 'download-button';
    const textContent = document.createTextNode('下载');
    downloadButton.appendChild(textContent);
    container.appendChild(downloadButton);
    downloadBtn = document.getElementById('download-button');
    downloadBtn.addEventListener('click', downloadData);
  }

  //用于下载选中数据
  function downloadData() {
    const checkboxes = document.querySelectorAll('input[type="checkbox"]');
    const selectedData = [];
    checkboxes.forEach((checkbox, index) => {
      if (checkbox.checked) {
        const div = document.getElementById(`data-item-${index}`);
        const data = div.textContent.split(': ')[1].trim();
        selectedData.push(data);
      }
    });
    const csv = selectedData.join(',\n');
    const blob = new Blob([csv]);
    const href = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.download = 'data.csv';
    link.href = href;
    link.click();
  }

  //用于上传文件夹
  function uploadFolder() {
    var inputElement = document.getElementById("folderInput");
    var files = inputElement.files;
  
    if (files.length > 0) {
      var zip = new JSZip();
  
      // 将文件夹中的文件添加到 ZIP 压缩包中
      for (var i = 0; i < files.length; i++) {
        var file = files[i];
        zip.folder(file.webkitRelativePath);
        zip.file(file.webkitRelativePath, file);
      }
      console.log(zip);
      // 生成压缩包
      zip.generateAsync({ type: "blob" }).then(function (content) {
        // 创建 FormData 对象，用于将文件发送到服务器
        var formData = new FormData();
        formData.append("file", content, "folder.zip");
        
        console.log(formData);
        // 使用 AJAX 进行文件上传
        var xhr = new XMLHttpRequest();
        xhr.open("POST", "/upload");
        xhr.send(formData);
  
        // 上传完成后的处理逻辑
        xhr.onload = function () {
          if (xhr.status === 200) {
            console.log("文件上传成功");
            // 在此处进行上传成功后的操作
          } else {
            console.log("文件上传失败");
            // 在此处进行上传失败后的操作
          }
        };
      });
    }
  }
  function search() {
    const searchInput = document.getElementById('search-input');
    const keyword = searchInput.value;
  
    const xhr = new XMLHttpRequest();
    const url = 'search';
    const params = `keyword=${encodeURIComponent(keyword)}`;
    xhr.open('GET', `${url}?${params}`);
    xhr.onreadystatechange = function() {
      if (xhr.readyState === XMLHttpRequest.DONE) {
        if (xhr.status === 200) {
          console.log('搜索成功');
          // 在这里处理搜索成功后的结果
          response = JSON.parse(xhr.responseText);
          renderData(response);
        } else {
          console.error('搜索失败');
          // 在这里处理搜索失败的情况
        }
      }
    };
    xhr.send();
  }

  function init(){
    // 初始化函数体
  }
  init();