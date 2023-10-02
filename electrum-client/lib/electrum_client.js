const Client = require("./client")
class ElectrumClient extends Client{
    constructor(port, host, protocol, options){
        super(port, host, protocol, options)
    }
    onClose(){
        super.onClose()
        const list = [
            'server.peers.subscribe',
            'blockchain.numblocks.subscribe',
            'blockchain.headers.subscribe',
            'blockchain.address.subscribe'
        ]
        list.forEach(event => this.subscribe.removeAllListeners(event))
    }
    server_version(client_name, protocol_version){
        return this.request('server.version', [client_name, protocol_version])
    }
    server_banner(){
        return this.request('server.banner', [])
    }
    serverDonation_address(){
        return this.request('server.donation_address', [])
    }
    serverPeers_subscribe(){
        return this.request('server.peers.subscribe', [])
    }
    blockchainAddress_getBalance(address){
        return this.request('blockchain.address.get_balance', [address])
    }
    blockchainAddress_getHistory(address){
        return this.request('blockchain.address.get_history', [address])
    }
    blockchainAddress_getMempool(address){
        return this.request('blockchain.address.get_mempool', [address])
    }
    blockchainAddress_getProof(address){
        return this.request('blockchain.address.get_proof', [address])
    }
    blockchainAddress_listunspent(address){
        return this.request('blockchain.address.listunspent', [address])
    }
    blockchainAddress_subscribe(address){
        return this.request('blockchain.address.subscribe', [address])
    }
    blockchainScripthash_getBalance(scripthash){
        return this.request('blockchain.scripthash.get_balance', [scripthash])
    }
    blockchainScripthash_getHistory(scripthash){
        return this.request('blockchain.scripthash.get_history', [scripthash])
    }
    blockchainScripthash_getMempool(scripthash){
        return this.request('blockchain.scripthash.get_mempool', [scripthash])
    }
    blockchainScripthash_listunspent(scripthash){
        return this.request('blockchain.scripthash.listunspent', [scripthash])
    }
    blockchainScripthash_subscribe(scripthash){
        return this.request('blockchain.scripthash.subscribe', [scripthash])
    }
    blockchainBlock_getHeader(height){
        return this.request('blockchain.block.get_header', [height])
    }
    blockchainBlock_getChunk(index){
        return this.request('blockchain.block.get_chunk', [index])
    }
    blockchainEstimatefee(number){
        return this.request('blockchain.estimatefee', [number])
    }
    blockchainHeaders_subscribe(){
        return this.request('blockchain.headers.subscribe', [])
    }
    blockchainNumblocks_subscribe(){
        return this.request('blockchain.numblocks.subscribe', [])
    }
    blockchain_relayfee(){
        return this.request('blockchain.relayfee', [])
    }
    blockchainTransaction_broadcast(rawtx){
        return this.request('blockchain.transaction.broadcast', [rawtx])
    }
    blockchainTransaction_get(tx_hash, height){
        return this.request('blockchain.transaction.get', [tx_hash])
    }
    blockchainTransaction_getMerkle(tx_hash, height){
        return this.request('blockchain.transaction.get_merkle', [tx_hash, height])
    }
    blockchainUtxo_getAddress(tx_hash, index){
        return this.request('blockchain.utxo.get_address', [tx_hash, index])
    }
    general_getRequest(method, params){
        return this.request(method, params)
    }
}

module.exports = ElectrumClient
