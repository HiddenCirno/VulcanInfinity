let configData = {};
let configPath = 'config.json';

// 递归渲染配置
function renderEditor(obj, parent, path = []) {
  parent.innerHTML = '';
  for (const key in obj) {
    if (key.startsWith('Desc')) continue; // desc单独处理
    const value = obj[key];
    const desc = obj['Desc' + key.replace(/^[^a-zA-Z0-9]*/, '')] || obj['Desc' + (parseInt(key) + 1)] || obj['Desc' + (Object.keys(obj).indexOf(key) + 1)] || obj['Desc' + key] || '';
    const row = document.createElement('div');
    row.className = 'section';
    const label = document.createElement('label');
    label.className = 'key';
    label.textContent = key;
    if (desc) {
      const descSpan = document.createElement('span');
      descSpan.className = 'desc';
      descSpan.textContent = desc;
      label.appendChild(descSpan);
    }
    row.appendChild(label);
    // 类型判断
    if (typeof value === 'boolean') {
      const input = document.createElement('input');
      input.type = 'checkbox';
      input.checked = value;
      input.onchange = () => setValue(path.concat(key), input.checked);
      row.appendChild(input);
    } else if (typeof value === 'number') {
      const input = document.createElement('input');
      input.type = 'number';
      input.value = value;
      input.onchange = () => setValue(path.concat(key), Number(input.value));
      row.appendChild(input);
    } else if (typeof value === 'string') {
      const input = document.createElement('input');
      input.type = 'text';
      input.value = value;
      input.onchange = () => setValue(path.concat(key), input.value);
      row.appendChild(input);
    } else if (Array.isArray(value)) {
      const arrayDiv = document.createElement('div');
      value.forEach((item, idx) => {
        const itemDiv = document.createElement('div');
        itemDiv.className = 'array-item';
        const itemInput = document.createElement('input');
        itemInput.type = typeof item === 'number' ? 'number' : 'text';
        itemInput.value = item;
        itemInput.onchange = () => {
          value[idx] = itemInput.type === 'number' ? Number(itemInput.value) : itemInput.value;
          setValue(path.concat(key), value);
        };
        itemDiv.appendChild(itemInput);
        // 删除按钮
        const delBtn = document.createElement('button');
        delBtn.textContent = '删除';
        delBtn.onclick = () => {
          value.splice(idx, 1);
          setValue(path.concat(key), value);
          render();
        };
        itemDiv.appendChild(delBtn);
        arrayDiv.appendChild(itemDiv);
      });
      // 添加按钮
      const addBtn = document.createElement('button');
      addBtn.textContent = '添加';
      addBtn.onclick = () => {
        value.push('');
        setValue(path.concat(key), value);
        render();
      };
      arrayDiv.appendChild(addBtn);
      row.appendChild(arrayDiv);
    } else if (typeof value === 'object' && value !== null) {
      const subDiv = document.createElement('div');
      subDiv.className = 'section';
      renderEditor(value, subDiv, path.concat(key));
      row.appendChild(subDiv);
    }
    parent.appendChild(row);
  }
}

function setValue(path, val) {
  let obj = configData;
  for (let i = 0; i < path.length - 1; i++) {
    obj = obj[path[i]];
  }
  obj[path[path.length - 1]] = val;
  render();
}

function render() {
  const editor = document.getElementById('editor');
  renderEditor(configData, editor);
}

// 读取文件
function readFile(file, cb) {
  const reader = new FileReader();
  reader.onload = e => {
    try {
      const json = JSON.parse(e.target.result);
      cb(json);
      document.getElementById('jsonError').textContent = '';
    } catch (err) {
      document.getElementById('jsonError').textContent = 'JSON解析错误: ' + err.message;
    }
  };
  reader.readAsText(file);
}

document.getElementById('fileInput').addEventListener('change', e => {
  const file = e.target.files[0];
  if (file) {
    readFile(file, json => {
      configData = json;
      render();
    });
  }
});

document.getElementById('presetInput').addEventListener('change', e => {
  const file = e.target.files[0];
  if (file) {
    readFile(file, preset => {
      mergePreset(configData, preset);
      render();
    });
  }
});

function downloadConfig() {
  const blob = new Blob([JSON.stringify(configData, null, 2)], {type: 'application/json'});
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'config.json';
  a.click();
}

function downloadPreset() {
  const blob = new Blob([JSON.stringify(configData, null, 2)], {type: 'application/json'});
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'preset.json';
  a.click();
}

// 递归合并预设，只覆盖已有字段
function mergePreset(target, preset) {
  for (const key in preset) {
    if (key in target) {
      if (typeof target[key] === 'object' && target[key] !== null && typeof preset[key] === 'object' && preset[key] !== null && !Array.isArray(target[key]) && !Array.isArray(preset[key])) {
        mergePreset(target[key], preset[key]);
      } else {
        target[key] = preset[key];
      }
    }
  }
}

// 初始化
fetch(configPath)
  .then(r => r.json())
  .then(json => {
    configData = json;
    render();
  })
  .catch(() => {
    configData = {};
    render();
  }); 