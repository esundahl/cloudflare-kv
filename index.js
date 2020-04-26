
const request = require('axios')
const qs = require('query-string')

function KV(id, email, key) {
	if (!(this instanceof KV)) return new KV(id, email, key)
	this._id = id
	this._email = email
	this._key = key
	this._url = `https://api.cloudflare.com/client/v4/accounts/${id}/storage/kv/namespaces`
	return this
}

KV.prototype.listNamespaces = function (opts) {
	return request.get(`${this._url}?page=${1}&per_page=${50}`, {
		headers: {
			'X-Auth-Email': this._email,
			'X-Auth-Key': this._key
		}
	})
		.then(response => response.data.result)
}

KV.prototype.createNamespace = function (title) {
	return request.post(this._url, { title }, {
		headers: {
			'X-Auth-Email': this._email,
			'X-Auth-Key': this._key,
			"Content-Type": 'application/json'
		}
	})
		.then(response => response.data.result)
}

KV.prototype.removeNamespace = function (id) {
	return request.delete(`${this._url}/${id}`, {
		headers: {
			'X-Auth-Email': this._email,
			'X-Auth-Key': this._key,
			"Content-Type": 'application/json'
		}
	})
		.then(response => Promise.resolve())
}

KV.prototype.renameNamespace = function (id, title) {
	return request.put(`${this._url}/${id}`, { title }, {
		headers: {
			'X-Auth-Email': this._email,
			'X-Auth-Key': this._key,
			'Content-Type': 'application/json'
		}
	})
		.then(response => Promise.resolve({ id, title }))
}

KV.prototype.findNamespaceByName = function (title) {
	return this.listNamespaces()
		.then(namespaces => namespaces.find(ns => ns.title === title))
}

KV.prototype.get = function (id, key) {
	return request.get(`${this._url}/${id}/values/${key}`, {
		headers: {
			'X-Auth-Email': this._email,
			'X-Auth-Key': this._key,
			'Content-Type': 'application/json'
		}
	})
		.then(({ data }) => {
			try {
				const parsed = JSON.parse(data)
				return data
			} catch (e) { return data }
		})
}

KV.prototype.put = function (id, key, value) {
	const kvs = (Array.isArray(key) ? key : [{ key, value }]).map(i => ({ key, value: JSON.stringify(i.value) }))
	return request.put(`${this._url}/${id}/bulk`, kvs, {
		headers: {
			'X-Auth-Email': this._email,
			'X-Auth-Key': this._key,
			'Content-Type': 'application/json'
		}
	})
}

KV.prototype.list = function (id, opts) {
	return request.get(`${this._url}/${id}/keys?${qs.stringify(opts)}`, {
		headers: {
			'X-Auth-Email': this._email,
			'X-Auth-Key': this._key
		}
	})
		.then(({ data }) => data.result.map(r => r.name))
}

KV.prototype.delete = function (id, key) {
	const ks = Array.isArray(key) ? key : [key]
	return request.delete(`${this._url}/bulk`, ks, {
		headers: {
			'X-Auth-Email': this._email,
			'X-Auth-Key': this._key
		}
	})
}

module.exports = KV
