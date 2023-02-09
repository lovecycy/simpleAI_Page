//  markdown配置
const markdownConfig = {
    hljs: {
        style: 'solarized-dark', // 代码主题
        lineNumber: true,   // 是否启用行号	
    },
    // anchor: 0,  // 为标题添加锚点 0：不渲染；1：渲染于标题前；2：渲染于标题后，默认 0
    theme: {
        current: 'ant-design'   //{ "ant-design": "Ant Design", dark: "Dark", light: "Light", wechat: "WeChat" }
    },
    after() {   // 渲染完成后
        const previewElement = document.getElementById('AnswerContainer'); //  markdown预览容器
        previewElement.style.opacity = 1;
    }
}

function busy() {
    document.getElementById('btn1').innerHTML = '中断'
    var load = document.getElementById('load')
    load.innerHTML = `<img style="width:100px;height:80px;" src="https://www.i996.me/img/load2.gif" />`
}
function free() {
    document.getElementById('btn1').innerHTML = '发送'
    var load = document.getElementById('load')
    load.innerHTML = `<img style="width:100px;height:80px;" src="https://www.i996.me/img/load1.png" />`
}
// 获取输入框的值并发送请求
function reqAnswer() {
    const token = document.getElementById('token').value;
    const question = document.getElementById('question').value;
    if (!(token && question)) {
        alert('请将token或者问题填写完整！');
        return null;
    }
    const requestConfig = {
        url: '/ask',
        type: 'POST',
        data: {
            "content": question
        },
        headers: {
            "Authorization": token,
            "Content-Type": "application/json;charset=UTF-8"
        },
        beforeSend() {
            busy();
            // 预览元素滚动到视口区
            document.getElementById("load").scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        },
        success(info) {
            // console.log(info);
            localStorage.setItem('_qdmsj_token', token)
        },
        error(err) {
            // console.log('err', err);
            // updatePreviewElement(JSON.stringify(err));
        },
        complete() {
            free()
        }
    }
    return $.ajax(requestConfig)
}

// 更新预览元素  
function updatePreviewElement(markdownText) {
    const previewElement = document.getElementById('AnswerContainer'); //  markdown预览容器
    Vditor.preview(previewElement, markdownText, markdownConfig)
}

// 获取回答
const getAnswer = (function () {
    let ajaxAnswer;// 闭包保存请求对象，目的是可以随时使用去终止请求
    return () => {
        let info = document.getElementById('btn1').innerHTML
        if (info == '中断') {
            ajaxAnswer.abort();
            free()
            return
        }
        new Promise((resolve, reject) => {
            ajaxAnswer = reqAnswer()
            if (ajaxAnswer === null) {
                // 如果reqAnswer()返回空则终止
                reject();
            }
            resolve(ajaxAnswer);
        }).then((result) => {
            // 请求成功
            updatePreviewElement(result);
        }).catch((err) => {
            // 请求被终止或者失败
            updatePreviewElement("### 你好.欢迎体验人工智能聊天机器人.");
        });
    }
})()
