function downloadSelected() {
    // 获取选中的文件列表
    var selectedFiles = getSelectedFiles();
  
    // 循环遍历选中的文件，并进行下载操作
    selectedFiles.forEach(function(file) {
      // 使用服务端接口下载文件
      // 这里需要调用你的服务端接口，并传递文件名或其他标识符
      // 例如，可以使用 AJAX 请求或创建隐藏的 <a> 元素进行下载
      // 下面是一个简单的示例，使用隐藏的 <a> 元素进行下载
      var link = document.createElement('a');
      link.href = 'http://yourserver.com/download?file=' + file;
      link.download = file;
      link.click();
    });
  }
  
  function downloadAll() {
    // 获取全部文件列表
    var allFiles = getAllFiles();
  
    // 循环遍历全部文件，并进行下载操作
    allFiles.forEach(function(file) {
      // 使用服务端接口下载文件
      // 这里需要调用你的服务端接口，并传递文件名或其他标识符
      // 例如，可以使用 AJAX 请求或创建隐藏的 <a> 元素进行下载
      // 下面是一个简单的示例，使用隐藏的 <a> 元素进行下载
      var link = document.createElement('a');
      link.href = 'http://yourserver.com/download?file=' + file;
      link.download = file;
      link.click();
    });
  }
  
  // 这里的 getSelectedFiles() 和 getAllFiles() 函数是用于获取选中的文件列表和全部文件列表的示例函数
  // 你需要根据你的实际情况实现这两个函数，从服务端获取文件列表数据
  function getSelectedFiles() {
    // 返回选中的文件列表
    // 例如，你可以遍历文件列表区域的元素，检查哪些文件被选中，并将它们加入到一个数组中
    // 返回包含选中文件的数组
  }
  
  function getAllFiles() {
    // 返回全部文件列表
    // 例如，你可以直接从服务端获取全部文件列表数据，并返回该数据
    // 返回包含全部文件的数组
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
  