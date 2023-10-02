'use strict'
const EventEmitter = require('events').EventEmitter
const util = require('./util')
const initSocket = require('./init_socket')
const connectSocket = require('./connect_socket')

class Client{
    constructor(port, host, protocol = 'tcp', options = void 0){
        this.id = 0;
        this.port = port
        this.host = host
        this.callback_message_queue = {}
        this.subscribe = new EventEmitter()
        this.conn = initSocket(this, protocol, options)
        this.mp = new util.MessageParser((body, n) => {
            this.onMessage(body, n)
        })
        this.status = 0
    }

    connect(){
        if(this.status) {
            return Promise.resolve()
        }
        this.status = 1
        return connectSocket(this.conn, this.port, this.host)
    }

    close(){
        if(!this.status) {
            return
        }
        this.conn.end()
        this.conn.destroy()
        this.status = 0
    }

    request(method, params){
        if(!this.status) {
            return Promise.reject(new Error('ESOCKET'))
        }
        return new Promise((resolve, reject) => {
            const id = ++this.id;
            const content = util.makeRequest(method, params, id);
            this.callback_message_queue[id] = util.createPromiseResult(resolve, reject);
            this.conn.write(content + '\n');
        })
    }

    response(msg){
        const callback = this.callback_message_queue[msg.id]
        if(callback){
            delete this.callback_message_queue[msg.id]
            if(msg.error){
                callback(msg.error)
            }else{
                callback(null, msg.result)
            }
        }else{
            ; // can't get callback
        }
    }

    onMessage(body, n){
        const msg = JSON.parse(body)
        if(msg instanceof Array){
            ; // don't support batch request
        } else {
            if(msg.id !== void 0){
                this.response(msg)
            }else{
                this.subscribe.emit(msg.method, msg.params)
            }
        }
    }

    onConnect(){
    }

    onClose(){
        Object.keys(this.callback_message_queue).forEach((key) => {
            this.callback_message_queue[key](new Error('close connect'))
            delete this.callback_message_queue[key]
        })
    }

    onRecv(chunk){
        this.mp.run(chunk)
    }

    onEnd(){
    }

    onError(e){
    }

}

module.exports = Client
