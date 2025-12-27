
console.log('popup.js' + new Date().getTime());

// 消息提示函数
function showMessage(text, type) {
    var toast = document.getElementById("messageToast");
    if (!toast) return;

    toast.textContent = text;
    toast.className = "message-toast show " + (type || "success");

    setTimeout(function () {
        toast.className = "message-toast";
    }, 3000);
}

// Custom Prompt Logic
var promptCallback = null;
var promptOverlay = document.getElementById('customPromptOverlay');
var promptInput = document.getElementById('promptInput');
var promptConfirmBtn = document.getElementById('promptConfirmBtn');
var promptCancelBtn = document.getElementById('promptCancelBtn');

function showPrompt(defaultValue, callback) {
    promptInput.value = defaultValue || '';
    promptCallback = callback;
    promptOverlay.style.display = 'flex';
    promptInput.focus();
    promptInput.select();
}

function closePrompt() {
    promptOverlay.style.display = 'none';
    promptCallback = null;
}

promptConfirmBtn.addEventListener('click', function () {
    var value = promptInput.value.trim();
    if (!value) {
        showMessage("请输入名称", "error");
        promptInput.focus();
        return;
    }
    if (promptCallback) {
        promptCallback(value);
    }
    closePrompt();
});

promptCancelBtn.addEventListener('click', closePrompt);

// Handle Enter key in input
promptInput.addEventListener('keydown', function (e) {
    if (e.key === 'Enter') {
        promptConfirmBtn.click();
    } else if (e.key === 'Escape') {
        closePrompt();
    }
});

document.getElementById("log").addEventListener("click", function () {
    //console.log('abc' + new Date().getTime());
    sendmsg();
});

document.getElementById("fanhui").addEventListener("click", function () {
    showdiv("div1");
});
document.getElementById("btn4").addEventListener("click", function () {
    showdiv("div1");
});

function showdiv(id) {
    document.getElementById("div1").style.display = "none";
    document.getElementById("div2").style.display = "none";
    document.getElementById("div3").style.display = "none";
    document.getElementById("div4").style.display = "none";
    document.getElementById(id).style.display = "block";
}
var cache = {};
//生成一个字符串数用缓存键
function getCacheKey(form) {
    var d = new Date().getTime();
    var key = "c" + d + Math.round(Math.random() * 100000000000000000);


    return key;
}
function gettxt(data) {
    var l = [];
    try {
        l = data.data.filter(function (item) {
            return item.tag == "INPUT" && item.type != "hidden" && item.value.length > 0;
        }).map(function (item) {
            return item.value;
        });
    } catch (e) {
        console.log(e);
    }
    var title = data.titlename || "";
    if (title.length > 0) {
        title = "<div class='desctitle'>" + title + "</div> ";
    }
    return title + "<div class='desctxt'>" + l.join("，") + "</div>";
}
function sendmsg() {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        var currentTabId = tabs[0].id;

        // 使用 webNavigation 获取所有 frame
        chrome.webNavigation.getAllFrames({ tabId: currentTabId }, function (frames) {
            var allForms = [];
            var processedCount = 0;
            var totalFrames = frames ? frames.length : 0;

            if (totalFrames === 0) {
                renderForms([]);
                return;
            }

            frames.forEach(function (frame) {
                chrome.tabs.sendMessage(
                    currentTabId,
                    { "msg": "getform" },
                    { frameId: frame.frameId },
                    function (response) {
                        processedCount++;

                        if (!chrome.runtime.lastError && response && response.data) {
                            allForms = allForms.concat(response.data);
                        }

                        if (processedCount === totalFrames) {
                            renderForms(allForms);
                        }
                    }
                );
            });
        });
    });
}

function renderForms(list) {
    var ul = document.getElementById("list2");
    showdiv("div2");

    if (list.length > 0) {
        ul.innerHTML = "";
    } else {
        ul.innerHTML = "<li>未发现表单</li>";
    }

    for (var i = 0; i < list.length; i++) {
        var li = document.createElement("li");
        var div = document.createElement("div");
        div.classList.add("desc");
        var btn = document.createElement("button");
        div.innerHTML = gettxt(list[i]);
        btn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg> 保存';
        var key = getCacheKey() + i;
        cache[key] = list[i];
        btn.setAttribute("data", key);
        btn.addEventListener("click", function (e) {

            var key = this.getAttribute("data");
            var data = cache[key];
            showPrompt(data.titlename || "", function (name) {
                var list = localStorage.list;
                if (list) {
                    list = JSON.parse(list);
                } else {
                    list = [];
                }
                data.key = key;
                data.title = name;
                list.push(data);
                localStorage.list = JSON.stringify(list);
                showMessage("保存成功", "success");
                setTimeout(function () {
                    location.reload();
                }, 1000);
            });
        });
        li.appendChild(div);
        li.appendChild(btn);

        ul.appendChild(li);
    }
}
function edit(data) {
    showdiv("div3");
    var list3 = document.getElementById("list3");
    var list = data.data;
    list3.innerHTML = "";
    var typeobj = {
        "INPUTtext": "文本框",
        "INPUTradio": "单选框",
        "INPUTcheckbox": "复选框",
        "INPUThidden": "隐藏域",
        "INPUTpassword": "密码框",
        "INPUTbutton": "按钮",
        "INPUTsubmit": "提交按钮",
        "INPUTreset": "重置按钮",
        "INPUTfile": "文件域",
        "INPUTimage": "图像域",
        "INPUTemail": "邮箱",
        "INPUTnumber": "数字",
        "INPUTtel": "电话",
        "INPUTurl": "url",
        "INPUTdate": "日期",
        "INPUTdatetime": "日期时间",
        "INPUTdatetime-local": "本地日期时间",
        "INPUTmonth": "月份",
        "INPUTweek": "周",
        "INPUTtime": "时间",
        "INPUTcolor": "颜色",
        "INPUTrange": "范围",
        "INPUTsearch": "搜索",
        "SELECT": "下拉框",
        "TEXTAREA": "文本域",
        "INPUT": "输入框",


    };
    cache = { data: data };
    for (var i = 0; i < list.length; i++) {
        var item = list[i];
        //按钮不可编辑直接跳过
        if (item.tag == "BUTTON" || item.type == "button" || item.type == "reset" || item.type == "submit" || item.type == "image" || item.type == "file") {
            continue;
        }

        var li = document.createElement("li");
        var div = document.createElement("div");
        div.classList.add("desc");
        var input = document.createElement("input");
        input.type = "checkbox";
        input.value = "填充此项";
        input.checked = true;
        var key = getCacheKey() + i;
        cache[key] = item;
        input.setAttribute("data", key);
        if (item.writeable === false) {
            input.checked = false;
        } else {
            if (item.tag == "INPUT" && item.type == "hidden") {
                input.checked = false;
            }
        }

        input.classList.add("writeable");
        div.appendChild(input);
        input.addEventListener("click", function (e) {
            var key = e.target.getAttribute("data");
            var item = cache[key];
            item.writeable = e.target.checked;
            //cache[key] = item;
        });
        var divtitle = document.createElement("div");
        divtitle.classList.add("desctitle");
        var typtxt = typeobj[item.tag + (item.tag == "INPUT" ? item.type : "")] || "表单元素";
        divtitle.textContent = typtxt;
        div.appendChild(divtitle);
        var divtxt = document.createElement("div");
        divtxt.classList.add("desctxt");
        if (item.value) {
            divtxt.textContent = item.value;
        } else {
            divtxt.innerHTML = "<color style='color:red'>未填写</color>";
        }
        if ((item.tag == "INPUT" && item.type != "radio" && item.type != "checkbox" && item.type != "hidden") || item.tag == "TEXTAREA") {
            var suijiinput = document.createElement("input");
            suijiinput.type = "text";
            suijiinput.classList.add("inputtxt");
            suijiinput.placeholder = "使用此内容填充，多个内容用英文逗号分隔，填充时会随机选择一个";
            suijiinput.title = "使用此内容填充，多个内容用英文逗号分隔，填充时会随机选择一个";
            if (item.suiji && item.suiji.length) {
                suijiinput.value = item.suiji.join(",");
            }
            suijiinput.setAttribute("data", key);
            divtxt.appendChild(suijiinput);
            suijiinput.addEventListener("change", function (e) {
                var key = e.target.getAttribute("data");
                var item = cache[key];

                try {
                    var v = e.target.value;
                    //去掉首尾空格
                    v = v.replace(/(^\s*)|(\s*$)/g, "");
                    if (!v) {
                        item.suiji = [];
                        suijiinput.value = "";
                        return;
                    }
                    v = v.split(",");
                    item.suiji = v;


                } catch (e) {
                    item.suiji = [];
                    alert("输入内容格式错误");
                    return;
                }
                item.suiji = item.suiji.filter(function (item) { return !!item; });

                //cache[key] = item;
            });

        }

        var divbtn = document.createElement("div");
        divbtn.classList.add("divbtn");
        divbtn.appendChild(input);
        div.appendChild(divtxt);
        div.appendChild(divbtn);
        //div.textContent = item.value;
        li.appendChild(div);
        list3.appendChild(li);
    }
    btn3.setAttribute("data", data.key);


}
var btn3 = document.getElementById("btn3");
btn3.addEventListener("click", function (e) {
    var key = this.getAttribute("data");
    var list = localStorage.list;
    if (list) {
        list = JSON.parse(list);
        for (var i = 0; i < list.length; i++) {
            if (list[i].key == key) {
                list[i].data = cache.data.data;
                localStorage.list = JSON.stringify(list);
                showMessage("保存成功", "success");
                break;
            }
        }
    }
    init();
});

function init() {
    showdiv("div1");
    var list = localStorage.list;
    var ul = document.getElementById("list");
    if (list) {
        list = JSON.parse(list);

        ul.innerHTML = "";

        for (var i = 0; i < list.length; i++) {
            var li = document.createElement("li");
            var div = document.createElement("div");
            div.classList.add("desc");
            var btn = document.createElement("button");
            div.textContent = list[i].title;
            btn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg> 填充';
            btn.setAttribute("data", list[i].key);
            var editbtn = document.createElement("button");
            editbtn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg> 编辑';
            editbtn.setAttribute("data", list[i].key);
            editbtn.addEventListener("click", function (e) {
                var key = this.getAttribute("data");
                var list = localStorage.list;
                if (list) {
                    list = JSON.parse(list);
                    for (var i = 0; i < list.length; i++) {
                        if (list[i].key == key) {
                            var data = list[i];
                            edit(data);
                            break;
                        }
                    }
                }
            });

            var delbtn = document.createElement("button");
            delbtn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg> 删除';
            delbtn.setAttribute("data", list[i].key);
            delbtn.addEventListener("click", function (e) {
                var key = this.getAttribute("data");
                var list = localStorage.list;
                if (list) {
                    list = JSON.parse(list);
                    for (var i = 0; i < list.length; i++) {
                        if (list[i].key == key) {
                            list.splice(i, 1);
                            break;
                        }
                    }
                    localStorage.list = JSON.stringify(list);
                    showMessage("删除成功", "success");
                    init();
                }
            });
            btn.addEventListener("click", function (e) {
                var key = this.getAttribute("data");
                var list = localStorage.list;
                if (list) {
                    list = JSON.parse(list);
                    for (var i = 0; i < list.length; i++) {
                        if (list[i].key == key) {
                            var data = list[i];
                            chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
                                var currentTabId = tabs[0].id;
                                chrome.webNavigation.getAllFrames({ tabId: currentTabId }, function (frames) {
                                    if (!frames) return;
                                    frames.forEach(function (frame) {
                                        chrome.tabs.sendMessage(
                                            currentTabId,
                                            {
                                                "msg": "fillform",
                                                "data": data
                                            },
                                            { frameId: frame.frameId },
                                            function (response) {
                                                if (chrome.runtime.lastError) {
                                                    // Ignore errors
                                                }
                                                // console.log(response);
                                            }
                                        );
                                    });
                                });
                            });
                            break;
                        }
                    }
                }
            });

            li.appendChild(div);

            var div2 = document.createElement("div");
            div2.classList.add("btns");
            div2.appendChild(btn);
            div2.appendChild(editbtn);
            div2.appendChild(delbtn);

            li.appendChild(div2);
            ul.appendChild(li);
        }

    }
}
setTimeout(() => {
    console.log('setTimeout' + new Date().getTime());
    init();
}, 0);
document.onload = function () {
    console.log('onload' + new Date().getTime());

}

// Import/Export functionality

// Helper function to compress data using gzip
async function compressData(data) {
    // Check if CompressionStream is supported
    if (typeof CompressionStream === 'undefined') {
        throw new Error('您的浏览器不支持数据压缩功能，请使用最新版本的 Chrome、Edge 或 Firefox 浏览器');
    }
    const blob = new Blob([data], { type: 'application/json' });
    const stream = blob.stream();
    const compressedStream = stream.pipeThrough(new CompressionStream('gzip'));
    const compressedBlob = await new Response(compressedStream).blob();
    return compressedBlob;
}

// Helper function to decompress gzip data
async function decompressData(compressedBlob) {
    // Check if DecompressionStream is supported
    if (typeof DecompressionStream === 'undefined') {
        throw new Error('您的浏览器不支持数据解压功能，请使用最新版本的 Chrome、Edge 或 Firefox 浏览器');
    }
    const stream = compressedBlob.stream();
    const decompressedStream = stream.pipeThrough(new DecompressionStream('gzip'));
    const decompressedBlob = await new Response(decompressedStream).blob();
    const text = await decompressedBlob.text();
    return text;
}

// Export button handler
document.getElementById("exportBtn").addEventListener("click", function () {
    var list = localStorage.list;
    if (!list || JSON.parse(list).length === 0) {
        alert("没有可导出的模板");
        return;
    }
    showExportDialog();
});

// Show export dialog with template selection
function showExportDialog() {
    var list = localStorage.list;
    if (list) {
        list = JSON.parse(list);
        var exportList = document.getElementById("exportList");
        exportList.innerHTML = "";

        for (var i = 0; i < list.length; i++) {
            var li = document.createElement("li");
            var label = document.createElement("label");
            label.style.display = "flex";
            label.style.alignItems = "center";
            label.style.cursor = "pointer";

            var checkbox = document.createElement("input");
            checkbox.type = "checkbox";
            checkbox.checked = true;
            checkbox.classList.add("export-checkbox");
            checkbox.setAttribute("data-key", list[i].key);

            var span = document.createElement("span");
            span.textContent = list[i].title;
            span.style.marginLeft = "8px";

            label.appendChild(checkbox);
            label.appendChild(span);
            li.appendChild(label);
            exportList.appendChild(li);
        }

        showdiv("div4");
    }
}

// Select all checkbox handler
document.getElementById("selectAllCheckbox").addEventListener("change", function (e) {
    var checkboxes = document.querySelectorAll(".export-checkbox");
    for (var i = 0; i < checkboxes.length; i++) {
        checkboxes[i].checked = e.target.checked;
    }
});

// Export confirm button handler
document.getElementById("exportConfirmBtn").addEventListener("click", async function () {
    var checkboxes = document.querySelectorAll(".export-checkbox");
    var selectedKeys = [];

    for (var i = 0; i < checkboxes.length; i++) {
        if (checkboxes[i].checked) {
            selectedKeys.push(checkboxes[i].getAttribute("data-key"));
        }
    }

    if (selectedKeys.length === 0) {
        alert("请至少选择一个模板");
        return;
    }

    var list = localStorage.list;
    if (list) {
        list = JSON.parse(list);
        // Convert to Set for O(1) lookup performance
        var selectedKeysSet = new Set(selectedKeys);
        var selectedTemplates = list.filter(function (item) {
            return selectedKeysSet.has(item.key);
        });

        try {
            var jsonData = JSON.stringify(selectedTemplates);
            var compressedBlob = await compressData(jsonData);

            // Create download link
            var url = URL.createObjectURL(compressedBlob);
            var a = document.createElement("a");
            a.href = url;
            // Remove milliseconds (.000) and timezone (Z) from ISO timestamp
            var timestamp = new Date().toISOString().replace(/[:.]/g, '-').replace(/\.\d{3}Z$/, '');
            a.download = "form-templates-" + timestamp + ".gz";
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

            showMessage("导出成功！共导出 " + selectedTemplates.length + " 个模板", "success");
            showdiv("div1");
        } catch (e) {
            console.error(e);
            showMessage("导出失败：" + e.message, "error");

            // Export cancel button handler

        }
    }
}
);

document.getElementById("exportCancelBtn").addEventListener("click", function () {
    showdiv("div1");
});

// Import button handler
document.getElementById("importBtn").addEventListener("click", function () {
    document.getElementById("importFile").click();
});

// Import file handler
document.getElementById("importFile").addEventListener("change", async function (e) {
    var file = e.target.files[0];
    if (!file) {
        return;
    }

    if (!file.name.endsWith('.gz')) {
        alert("请选择 .gz 格式的文件");
        e.target.value = "";
        return;
    }

    try {
        var decompressedData = await decompressData(file);
        var importedTemplates = JSON.parse(decompressedData);

        if (!Array.isArray(importedTemplates)) {
            throw new Error("无效的数据格式");
        }

        var list = localStorage.list;
        if (list) {
            list = JSON.parse(list);
        } else {
            list = [];
        }

        // Create Set of existing keys for O(1) lookup performance
        var existingKeysSet = new Set(list.map(function (item) { return item.key; }));

        var importCount = 0;
        for (var i = 0; i < importedTemplates.length; i++) {
            var template = importedTemplates[i];
            var newKey = template.key;
            var counter = 1;

            // Keep generating new keys until we find one that doesn't exist
            while (existingKeysSet.has(newKey)) {
                newKey = template.key + "_imported_" + counter;
                counter++;
            }

            template.key = newKey;
            existingKeysSet.add(newKey); // Add to set to avoid conflicts in this batch
            list.push(template);
            importCount++;
        }

        localStorage.list = JSON.stringify(list);
        showMessage("导入成功！共导入 " + importCount + " 个模板", "success");
        init();
    } catch (e) {
        console.error(e);
        showMessage("导入失败：" + e.message, "error");
    }

    e.target.value = "";
});

// More actions button handler
document.getElementById("moreActionsBtn").addEventListener("click", function () {
    var div = document.getElementById("moreActionsDiv");
    var svgUp = '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-left: 4px;"><polyline points="18 15 12 9 6 15"/></svg>';
    var svgDown = '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-left: 4px;"><polyline points="6 9 12 15 18 9"/></svg>';

    if (div.style.display === "none") {
        div.style.display = "flex";
        this.innerHTML = "更多操作 " + svgUp;
    } else {
        div.style.display = "none";
        this.innerHTML = "更多操作 " + svgDown;
    }
});