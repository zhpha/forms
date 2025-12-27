// 一个简单的浏览器插件，用于查找和填写表单
// 声明一个全局变量，用于存储表单模板
var formTemplates = {};

// 定义一个函数，用于查找当前页面上的所有表单元素
function findForms() {
    // 获取当前页面的文档对象
    var doc = document;

    // 获取当前页面上的所有表单元素
    var forms = doc.getElementsByTagName("form");
    var list = [];
    var title = doc.title;
    // 如果在iframe中，title可能为空，可以使用location.href或者父级title
    if (!title && window.location.href) {
        title = window.location.href;
    }

    var page = window.location.pathname;

    // 遍历所有的表单元素
    for (var i = 0; i < forms.length; i++) {
        var form = forms[i];
        form.titlename = title;
        form.page = page;
        // 标记是否在 iframe 中
        form.isIframe = (window.self !== window.top);
        list.push(form);
    }

    // 返回表单元素的数组
    return list;
}

// 定义一个函数，用于记录当前表单的值，并保存为模板
function getformdata(form) {

    // 获取表单的所有输入元素
    var inputs = form.elements;
    // 创建一个空对象，用于存储表单的值
    var items = []
    // 遍历所有的输入元素
    for (var i = 0; i < inputs.length; i++) {
        var item = {};
        item.id = inputs[i].id;
        item.name = inputs[i].name;
        item.value = inputs[i].value;
        items.push(item);
        item.type = inputs[i].type;
        item.tag = inputs[i].tagName;
        item.checked = inputs[i].checked;
        // 获取当前输入元素
        var input = inputs[i];
        // 获取输入元素的名称和值
        var name = input.name;
        var value = input.value;
        // 如果输入元素有名称和值，则将它们保存到表单数据对象中

    }

    // 返回表单id
    return items;
}

// 定义一个函数，用于根据模板填写表单
function fillForm(form, template) {
    var data = template.data;
    var inputs = form.elements;
    var list = [];
    for (var i = 0; i < inputs.length; i++) {
        var item = inputs[i];
        list.push(item);
    }
    // 获取表单的所有输入元素
    for (var i = 0; i < data.length; i++) {
        var item = data[i];
        if (item.writeable === false) {
            continue;
        }
        var input = null;
        if (item.id) {
            input = list.filter(itm => itm.id == item.id)[0];
        }
        if (!input && item.name) {
            input = list.filter(itm => itm.name == item.name)[0];
        }
        if (input) {
            if (input.type == 'checkbox' || input.type == 'radio') {
                input = list.filter(itm => itm.name == item.name && itm.value == item.value)[0];
                if (input) {
                    input.checked = item.checked
                } else {
                    // list[i].checked = item.checked;
                }

            } else {
                if (item.tag != 'BUTTON' && item.type != 'submit' && item.type != 'reset') {
                    if (item.type == "hidden") {
                        if (item.writeable === true) {
                            input.value = item.value;
                            input.dispatchEvent(new Event('input', { bubbles: true }));
                        }
                    } else {
                        if (item.suiji && item.suiji.length) {
                            //从列表里随机取一个
                            var index = Math.floor(Math.random() * item.suiji.length);
                            input.value = item.suiji[index];
                        } else {
                            input.value = item.value;
                        }
                        input.dispatchEvent(new Event('input', { bubbles: true }));
                    }

                } else {
                    //input.value = item.value;
                }

            }
        }
    }
}




console.log(location.pathname);
//chrome.browserAction.onClicked.addListener(init);
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    // console.log(request, sender, sendResponse);
    if (request.msg == 'getform') {
        var forms = findForms();
        // 如果当前 frame 没有表单，直接返回空，避免干扰
        if (forms.length === 0) {
            sendResponse({ msg: 'getform', data: [] });
            return;
        }

        formTemplates = {};
        var list = [];
        for (var i = 0; i < forms.length; i++) {
            var form = forms[i];
            var fobj = {};
            fobj.id = form.id;
            fobj.name = form.name;
            fobj.titlename = form.titlename;
            fobj.page = form.page;
            fobj.index = i;
            fobj.url = window.location.href; // 增加 frame 标识
            var data = getformdata(form);
            fobj.data = data;
            list.push(fobj);
        }
        var msg = { msg: 'getform', data: list };
        // console.log(msg);
        sendResponse(msg);
    } else if (request.msg == 'fillform') {
        var forms = findForms();
        var data = request.data;

        // 增加判断：如果数据中包含 url，且与当前 frame url 不匹配，则忽略
        // 修改：只比较 origin + pathname，忽略参数(?...)和哈希(#...)
        // 进一步修改：如果 pathname 中的某一段纯数字不同，也视为匹配（视为动态ID）
        if (data.url) {
            try {
                var currentUrlObj = new URL(window.location.href);
                var savedUrlObj = new URL(data.url);

                // 1. 比较 Origin (协议 + 域名 + 端口)
                if (currentUrlObj.origin !== savedUrlObj.origin) {
                    sendResponse({ msg: 'fillform', data: 'not_match_frame' });
                    return;
                }

                // 2. 比较 Pathname，允许数字段不同
                var currentSegments = currentUrlObj.pathname.split('/');
                var savedSegments = savedUrlObj.pathname.split('/');

                if (currentSegments.length !== savedSegments.length) {
                    sendResponse({ msg: 'fillform', data: 'not_match_frame' });
                    return;
                }

                for (var i = 0; i < currentSegments.length; i++) {
                    var cSeg = currentSegments[i];
                    var sSeg = savedSegments[i];

                    if (cSeg !== sSeg) {
                        // 如果不相等，检查是否都是纯数字
                        var isCNumeric = /^\d+$/.test(cSeg);
                        var isSNumeric = /^\d+$/.test(sSeg);

                        // 只要有一方不是数字，则认为不匹配
                        if (!isCNumeric || !isSNumeric) {
                            sendResponse({ msg: 'fillform', data: 'not_match_frame' });
                            return;
                        }
                    }

                }
            } catch (e) {
                // URL 解析失败，回退到严格全等匹配
                if (data.url !== window.location.href) {
                    sendResponse({ msg: 'fillform', data: 'not_match_frame' });
                    return;
                }
            }

            var form = null;
            if (data.id) {
                form = forms.filter(function (item) {
                    return item.id == data.id;
                })[0];
            }
            if (!form && data.name) {
                form = forms.filter(function (item) {
                    return item.name == data.name;
                })[0];
            }
            if (!form && typeof data.index !== 'undefined') {
                form = forms[data.index];
            }

            if (form) {
                fillForm(form, data);
                sendResponse({ msg: 'fillform', data: 'ok' });
            } else {
                sendResponse({ msg: 'fillform', data: 'not_found' });
            }
        }
    }
});