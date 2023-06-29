document.addEventListener("DOMContentLoaded", function() {
  var drives = document.getElementsByClassName("drive");
  var foldersContainer = document.getElementById("folders-list");

  // 盘符点击事件处理程序
  for (var i = 0; i < drives.length; i++) {
      drives[i].addEventListener("click", function() {
          // 移除其他盘符的选中状态
          for (var j = 0; j < drives.length; j++) {
              drives[j].classList.remove("selected");
          }

          // 添加当前盘符的选中状态
          this.classList.add("selected");

          // 获取盘符路径
          var drivePath = this.getAttribute("data-path");

          // 加载子文件夹列表
          loadFolders(drivePath);
      });
  }

  // 文件夹点击事件处理程序（事件委托）
foldersContainer.addEventListener("click", function(e) {
  if (e.target && e.target.classList.contains("folder")) {
      // 移除其他文件夹的选中状态
      var folders = document.getElementsByClassName("folder");
      for (var i = 0; i < folders.length; i++) {
          folders[i].classList.remove("selected");
      }

      // 添加当前文件夹的选中状态
      e.target.classList.add("selected");

      // 获取文件夹路径
      var folderPath = e.target.getAttribute("data-path");

      // 更新隐藏字段的值
      document.getElementById("folder").value = folderPath;


      // 加载子文件夹列表
      loadFolders(folderPath);
  }
});

  // 搜索表单提交事件处理程序
document.getElementById("search-form").addEventListener("submit", function(e) {
  e.preventDefault(); // 阻止表单的默认提交行为

  // 更新隐藏字段的值
  var drive = document.querySelector(".drive.selected");
  var selectedDrive = drive ? drive.getAttribute("data-path") : "";
  document.getElementById("drive").value = selectedDrive;

  var formData = new FormData(this); // 获取表单数据
    fetch('/search', {
        method: 'POST',
        body: formData
    })
    .then(function(response) {
        // console.log(response.json());
        return response.json(); // 将响应数据解析为JSON格式
    })
    .then(function(data) {
        renderResults(data); // 调用渲染结果的函数
    })
    .catch(function(error) {
        console.log('Error:', error);
    });
});

function renderResults(data) {
    var container = document.getElementById('results-container');
    container.innerHTML = ''; // 清空容器中的内容
    console.log("start rendering results");
    for (var filePath in data) {
        console.log(filePath);
        let fileData = data[filePath];
        
        console.log(fileData);
        var heading = document.createElement('h3');
        heading.textContent = fileData.file_path;
        container.appendChild(heading);

        var separator = document.createElement('hr');
        container.appendChild(separator);

        for (var lineNumber in fileData.lines) {
            var lineContent = fileData.lines[lineNumber].line_content;
            var line = document.createElement('p');
            
            var checkbox = document.createElement('input');
            checkbox.type = 'checkbox';

            var ln = parseInt(lineNumber) + 1;

            checkbox.value = fileData.file_path + '@' + ln; // 设置复选框的值为 文件路径:行号
            line.id = fileData.file_path + '@' + ln; // 设置行号的 id 层次;
            line.textContent = '行号 ' + ln + ':' + lineContent;
            keyword = document.getElementById("keyword").value;
            console.log(keyword);
            line.innerHTML = highlightKeyword(line.innerHTML, keyword); // 调用高亮关键字的函数
            // 添加到同一容器中
            var lineContainer = document.createElement('div');
            lineContainer.appendChild(checkbox);
            lineContainer.appendChild(line);

            container.appendChild(lineContainer);
        }
    }
}
function highlightKeyword(text, keyword) {
  var regex = new RegExp(keyword, 'gi');
  return text.replace(regex, '<span class="highlighted">$&</span>');
}
document.getElementById('save-button').addEventListener('click', function() {
  var checkboxes = document.querySelectorAll('input[type="checkbox"]:checked');
  var selectedResults = [];

  checkboxes.forEach(function(checkbox) {
      selectedResults.push(checkbox.value);
  });

  if (selectedResults.length > 0) {
      downloadResults(selectedResults);
  }
});


document.getElementById('comfirm-button').addEventListener('click', function() {
    folderPath = document.getElementById("current-folder").textContent;
    // 构建要发送的数据对象
    var data = { "folder": folderPath };
    const fd = new FormData();
    Object.entries(data).forEach(([key, value]) => {
        fd.append(key, value);
      });
    console.log(fd);
    fetch('/makeIndex', {
      method: 'POST',
      body: fd
    })
    .then(function(response) {
        console.log(response);
    })
    .catch(function(error) {
        console.log('Error:', error);
    });
});

function downloadResults(selectedResults) {
  // 创建一个包含选中结果的数据对象
  var downloadData = {};
  selectedResults.forEach(function(result) {
    console.log(result);
      var [filePath, lineNumber] = result.split('@');
      console.log(filePath, lineNumber);
      if (!downloadData[filePath]) {
          downloadData[filePath] = {};
      }
      downloadData[filePath][lineNumber] = document.getElementById(result).textContent;
      console.log(downloadData[filePath][lineNumber]);
      console.log(downloadData);
  });
  console.log(downloadData);
  // 将数据转换为JSON格式
  var jsonData = JSON.stringify(downloadData);

  // 创建一个临时的Blob对象
  var blob = new Blob([jsonData], { type: 'application/json' });

  // 创建一个临时的URL对象
  var url = URL.createObjectURL(blob);

  // 创建一个隐藏的链接并触发点击事件来下载文件
  var link = document.createElement('a');
  link.href = url;
  link.download = 'results.json';
  link.style.display = 'none';
  document.body.appendChild(link);
  link.click();

}


  // 加载子文件夹列表
  function loadFolders(folderPath) {
      // 发送AJAX请求获取子文件夹列表
      var xhr = new XMLHttpRequest();
      xhr.onreadystatechange = function() {
          if (xhr.readyState === 4 && xhr.status === 200) {
              // 清空文件夹列表容器
              foldersContainer.innerHTML = "";

              // 解析响应数据
              var folders = JSON.parse(xhr.responseText);

              // 构建子文件夹列表
              if (folderPath !== "") {
                  var parentFolder = document.createElement("div");
                  parentFolder.classList.add("folder");
                  parentFolder.setAttribute("data-path", folderPath.substring(0, folderPath.lastIndexOf("\\")));
                  parentFolder.innerHTML = "..";
                  foldersContainer.appendChild(parentFolder);
              }

              for (var i = 0; i < folders.length; i++) {
                  var folder = document.createElement("div");
                  folder.classList.add("folder");
                  folder.setAttribute("data-path", folderPath + "\\" + folders[i]);
                  folder.innerHTML = folders[i];
                  foldersContainer.appendChild(folder);
              }
              const currentFolderElement = document.getElementById("current-folder");
              console.log(folderPath);
              currentFolderElement.textContent = folderPath;
          }
      };
      xhr.open("GET", "/get_folders?path=" + encodeURIComponent(folderPath), true);
      xhr.send();
  }
});
