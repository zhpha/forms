// 一个简单的浏览器插件，用于查找和填写表单
// 声明一个全局变量，用于存储表单模板
var formTemplates = {};

// 定义一个函数，用于查找当前页面上的所有表单元素
function findForms(win) {
    var win = win || window;
    // 获取当前页面的文档对象
    var document = win.document || win.contentDocument
    // 获取当前页面上的所有表单元素
    var forms = document.getElementsByTagName("form");
    var list = [];
    var title = document.title;
    var page = win.location.pathname;
    // 遍历所有的表单元素
    for (var i = 0; i < forms.length; i++) {

        var form = forms[i];
        form.titlename = title;
        form.page = page;
        list.push(form);

    }
    // 获取当前页面上的所有内嵌框架
    var iframes = document.getElementsByTagName("iframe");
    // 遍历所有的内嵌框架
    for (var i = 0; i < iframes.length; i++) {
        // 获取当前内嵌框架
        var iframe = iframes[i];
        // 获取内嵌框架的文档对象
        //var iframeDocument = iframe.contentDocument;
        // 获取内嵌框架中的表单元素
        // var iframeForms = iframeDocument.getElementsByTagName("form");
        // // 将内嵌框架中的表单元素添加到表单元素数组中
        // for (var j = 0; j < iframeForms.length; j++) {
        //     list.push(iframeForms[j]);
        // }
        var ls = findForms(iframe.contentWindow);
        if (ls && ls.length > 0) {
            list = list.concat(ls);
        }
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
                        }
                    } else {
                        if (item.suiji && item.suiji.length) {
                            //从列表里随机取一个
                            var index = Math.floor(Math.random() * item.suiji.length);
                            input.value = item.suiji[index];
                        } else {
                            input.value = item.value;
                        }
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
    console.log(request, sender, sendResponse);
    if (request.msg == 'getform') {
        var forms = findForms();
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
            var data = getformdata(form);
            fobj.data = data;
            list.push(fobj);
            // formTemplates[formId] = formTemplates[formId] || {};
            // formTemplates[formId].form = form;
        }
        var msg = { msg: 'getform', data: list };
        console.log(msg);
        sendResponse(msg);
    } else if (request.msg == 'fillform') {
        var forms = findForms();
        var data = request.data;
        var form = null;
        if (data.id) {
            form = forms.filter(function (item) {
                return item.id == data.id && item.page == data.page;
            })[0];
        }
        if (!form && data.name) {
            form = forms.filter(function (item) {
                return item.name == data.name && item.page == data.page;
            })[0];
        }
        if (!form) {
            form = forms[data.index];
        }
        if (form) {
            fillForm(form, data);
        }
        sendResponse({ msg: 'fillform', data: 'ok' });
    }
});