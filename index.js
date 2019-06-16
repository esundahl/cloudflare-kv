
const request = require('axios')

function KV (id, email, key) {
	if (!(this instanceof KV)) return new KV(id, email, key)
	this._id = id
	this._email = email
	this._key = key
	return this
}

KV.prototype.listNamespaces = function(opts) {
	return request.get(`https://api.cloudflare.com/client/v4/accounts/${this._id}/storage/kv/namespaces?page=${1}&per_page=${50}`, {
		headers: {
			'X-Auth-Email': this._email,
			'X-Auth-Key': this._key
		}
	})
		.then(response => response.data.result)
}

KV.prototype.createNamespace = function(title) {
	return request.post(`https://api.cloudflare.com/client/v4/accounts/${this._id}/storage/kv/namespaces`, {title}, {
		headers: {
			'X-Auth-Email': this._email,
			'X-Auth-Key': this._key,
			"Content-Type": 'application/json'
		}
	})
		.then(response => response.data.result)
}

KV.prototype.removeNamespace = function(id) {
	return request.delete(`https://api.cloudflare.com/client/v4/accounts/${this._id}/storage/kv/namespaces/${id}`, {
		headers: {
			'X-Auth-Email': this._email,
			'X-Auth-Key': this._key,
			"Content-Type": 'application/json'
		}
	})
		.then(response => Promise.resolve())
}

KV.prototype.renameNamespace = function(id, title) {
	return request.put(`https://api.cloudflare.com/client/v4/accounts/${this._id}/storage/kv/namespaces/${id}`, {title} , {
		headers: {
			'X-Auth-Email': this._email,
			'X-Auth-Key': this._key,
			'Content-Type': 'application/json'
		}
	})
		.then(response => Promise.resolve({id, title}))
}

KV.prototype.findNamespaceByName = function(name) {
  return this.listNamespaces()
		.then(namespaces => namespaces.find(ns => ns.name === name))
}

KV.prototype.listKeys = function(id, opts = {limit, cursor}) {
	return request.get(`https://api.cloudflare.com/client/v4/accounts/${this._id}/storage/kv/namespaces/${id}/keys?limit=${limit}&cursor=${cursor}`, {
		headers: {
			'X-Auth-Email': this._email,
			'X-Auth-Key': this._key,
			'Content-Type': 'application/json'
		}
	})
		.then(response => Promise.resolve())
}

KV.prototype.readKey = function(id, key) {
	return request.get(`https://api.cloudflare.com/client/v4/accounts/${this._id}/storage/kv/namespaces/${id}/values/${key}`, {
		headers: {
			'X-Auth-Email': this._email,
			'X-Auth-Key': this._key,
			'Content-Type': 'application/json'
		}
	})
		.then(({data}) => {
			try {
				const parsed = JSON.parse(data)
				return data
			} catch (e) { return data}
		})
}

KV.prototype.writeKey = function(id, key, value) {
	const val = typeof value === 'string' ? value : JSON.stringify(value)
  return request.put(`https://api.cloudflare.com/client/v4/accounts/${this._id}/storage/kv/namespaces/${id}/values/${key}`, val, {
		headers: {
			'X-Auth-Email': this._email,
			'X-Auth-Key': this._key,
			'Content-Type': 'text/plain'
		}
	})
		.then(response => Promise.resolve({key, value: val}))
}

KV.prototype.listKeys = function(id) {
	return request.get(`https://api.cloudflare.com/client/v4/accounts/${this._id}/storage/kv/namespaces/${id}/keys`, {
		headers: {
			'X-Auth-Email': this._email,
			'X-Auth-Key': this._key
		}
	})
		.then(({data}) => data.result.map(r => r.name))
}

KV.prototype.removeKey = function(id, key) {
	return request.delete(`https://api.cloudflare.com/client/v4/accounts/${this._id}/storage/kv/namespaces/${id}/values/${key}`, {
		headers: {
			'X-Auth-Email': this._email,
			'X-Auth-Key': this._key
		}
	})
		.then(({data}) => data)
}

module.exports = KV
