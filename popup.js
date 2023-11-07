
console.log('popup.js' + new Date().getTime());
document.getElementById("log").addEventListener("click", function () {
    //console.log('abc' + new Date().getTime());
    sendmsg();
});

document.getElementById("fanhui").addEventListener("click", function () {
    showdiv("div1");
});

function showdiv(id) {
    document.getElementById("div1").style.display = "none";
    document.getElementById("div2").style.display = "none";
    document.getElementById("div3").style.display = "none";
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
        chrome.tabs.sendMessage(
            tabs[0].id,
            {
                "msg": "getform"
            },
            function (response) {
                console.log(response);
                var list = response.data;
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
                    btn.textContent = "保存";
                    var key = getCacheKey() + i;
                    cache[key] = list[i];
                    btn.setAttribute("data", key);
                    btn.addEventListener("click", function (e) {

                        var key = e.target.getAttribute("data");
                        var data = cache[key];
                        var name = prompt("请输入保存名称", data.titlename || "");
                        if (!name) {
                            alert("请输入保存名称");
                            return;
                        }
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
                        alert("保存成功");
                        location.reload();
                    });
                    li.appendChild(div);
                    li.appendChild(btn);

                    ul.appendChild(li);
                }

            }
        );
    });
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
    var key = e.target.getAttribute("data");
    var list = localStorage.list;
    if (list) {
        list = JSON.parse(list);
        for (var i = 0; i < list.length; i++) {
            if (list[i].key == key) {
                list[i].data = cache.data.data;
                localStorage.list = JSON.stringify(list);
                alert("保存成功");
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
            btn.textContent = "填充";
            btn.setAttribute("data", list[i].key);
            var editbtn = document.createElement("button");
            editbtn.textContent = "编辑";
            editbtn.setAttribute("data", list[i].key);
            editbtn.addEventListener("click", function (e) {
                var key = e.target.getAttribute("data");
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
            delbtn.textContent = "删除";
            delbtn.setAttribute("data", list[i].key);
            delbtn.addEventListener("click", function (e) {
                var key = e.target.getAttribute("data");
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
                    init();
                }
            });
            btn.addEventListener("click", function (e) {
                var key = e.target.getAttribute("data");
                var list = localStorage.list;
                if (list) {
                    list = JSON.parse(list);
                    for (var i = 0; i < list.length; i++) {
                        if (list[i].key == key) {
                            var data = list[i];
                            chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
                                chrome.tabs.sendMessage(
                                    tabs[0].id,
                                    {
                                        "msg": "fillform",
                                        "data": data
                                    },
                                    function (response) {
                                        console.log(response);
                                    }
                                );
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

