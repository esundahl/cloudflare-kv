

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
	return fetch(`${this._url}?page=${1}&per_page=${50}`, {
		method: 'GET',
		headers: {
			'X-Auth-Email': this._email,
			'X-Auth-Key': this._key
		}
	})
		.then(response => response.json())
		.then(data => data.result)
}

KV.prototype.createNamespace = function (title) {
	return fetch(this._url, {
		method: 'POST',
		headers: {
			'X-Auth-Email': this._email,
			'X-Auth-Key': this._key,
			"Content-Type": 'application/json'
		},
		body: JSON.stringify({ title })
	})
		.then(response => response.json())
		.then(({ result }) => result)
}

KV.prototype.removeNamespace = function (id) {
	return fetch(`${this._url}/${id}`, {
		method: 'DELETE',
		headers: {
			'X-Auth-Email': this._email,
			'X-Auth-Key': this._key,
			"Content-Type": 'application/json'
		}
	})
		.then(response => response.json())
}

KV.prototype.renameNamespace = function (id, title) {
	return fetch(`${this._url}/${id}`, {
		method: 'PUT',
		headers: {
			'X-Auth-Email': this._email,
			'X-Auth-Key': this._key,
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({ title })
	})
		.then(response => Promise.resolve({ id, title }))
}

KV.prototype.findNamespaceByName = function (title) {
	return this.listNamespaces()
		.then(namespaces => namespaces.find(ns => ns.title === title))
}

KV.prototype.get = function (id, key) {
	return fetch(`${this._url}/${id}/values/${key}`, {
		method: 'GET',
		headers: {
			'X-Auth-Email': this._email,
			'X-Auth-Key': this._key,
			'Content-Type': 'application/json'
		}
	})
		.then(response => response.json().catch(err => response.text()))
}

KV.prototype.put = function (id, key, value) {
	const kv = (Array.isArray(key) ? key : [{ key, value }]).map(i => ({ key: i.key, value: JSON.stringify(i.value) }))
	return fetch(`${this._url}/${id}/bulk`, {
		method: 'PUT',
		headers: {
			'X-Auth-Email': this._email,
			'X-Auth-Key': this._key,
			'Content-Type': 'application/json'
		},
		body: (typeof kv === 'string') ? kv : JSON.stringify(kv)
	})
		.then(() => value || key)
}

KV.prototype.list = function (id, opts) {
	return fetch(`${this._url}/${id}/keys?${qs.stringify(opts)}`, {
		method: 'GET',
		headers: {
			'X-Auth-Email': this._email,
			'X-Auth-Key': this._key
		}
	})
		.then(response => response.json())
		.then(({ result }) => result.map(r => r.name))
}

KV.prototype.delete = function (id, key) {
	const kv = Array.isArray(key) ? key : [key]
	return fetch(`${this._url}/bulk`, {
		method: 'DELETE',
		headers: {
			'X-Auth-Email': this._email,
			'X-Auth-Key': this._key
		},
		body: JSON.stringify(kv)
	})
		.then(response => response.json())
}

module.exports = KV
