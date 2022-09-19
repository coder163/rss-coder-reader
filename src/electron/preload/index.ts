function domReady(condition: DocumentReadyState[] = ['complete', 'interactive']) {
    return new Promise(resolve => {
        if (condition.includes(document.readyState)) {
            resolve(true)
        } else {
            document.addEventListener('readystatechange', () => {
                if (condition.includes(document.readyState)) {
                    resolve(true)
                }
            })
        }
    })
}

const safeDOM = {
    append(parent: HTMLElement, child: HTMLElement) {
        if (!Array.from(parent.children).find(e => e === child)) {
            return parent.appendChild(child)
        }
    },
    remove(parent: HTMLElement, child: HTMLElement) {
        if (Array.from(parent.children).find(e => e === child)) {
            return parent.removeChild(child)
        }
    },
}

/**
 * https://tobiasahlin.com/spinkit
 * https://connoratherton.com/loaders
 * https://projects.lukehaas.me/css-loaders
 * https://matejkustec.github.io/SpinThatShit
 */
function useLoading() {
    const className = `loading`
    const styleContent = `
  body {
    background: #ecf0f6;
    text-align: center;
    padding: 20%;
  }

.${className} span {
  display: inline-block;
  vertical-align: middle;
  width: .6em;
  height: .6em;
  margin: .19em;
  background: #007DB6;
  border-radius: .6em;
  animation: loading 1s infinite alternate;
}
.${className}  span:nth-of-type(2) {
  background: #008FB2;
  animation-delay: 0.2s;
}
.${className}  span:nth-of-type(3) {
  background: #009B9E;
  animation-delay: 0.4s;
}
.${className}  span:nth-of-type(4) {
  background: #00A77D;
  animation-delay: 0.6s;
}
.${className}  span:nth-of-type(5) {
  background: #00B247;
  animation-delay: 0.8s;
}
.${className}  span:nth-of-type(6) {
  background: #5AB027;
  animation-delay: 1.0s;
}
.${className}  span:nth-of-type(7) {
  background: #A0B61E;
  animation-delay: 1.2s;
}
@keyframes loading {
  0% {
    opacity: 0;
  }
  100% {
    opacity: 1;
  }
}
    `
    const oStyle = document.createElement('style')
    const oDiv = document.createElement('div')

    oStyle.id = 'app-loading-style'
    oStyle.innerHTML = styleContent
    oDiv.className = className
    oDiv.innerHTML = `
  <h4>正在努力加载,请稍后</h4>
  <span></span> <span></span> <span></span>
  <span></span> <span></span> <span></span>
  <span></span> <span></span> <span></span>
 `

    return {
        appendLoading() {
            safeDOM.append(document.head, oStyle)
            safeDOM.append(document.body, oDiv)
        },
        removeLoading() {
            safeDOM.remove(document.head, oStyle)
            safeDOM.remove(document.body, oDiv)
        },
    }
}

// ----------------------------------------------------------------------

const {appendLoading, removeLoading} = useLoading()
domReady().then(appendLoading)

window.onmessage = ev => {

    ev.data.payload === 'removeLoading' && removeLoading()
}

// setTimeout(removeLoading, 10)
