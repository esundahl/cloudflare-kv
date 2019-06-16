const test = require('blue-tape')
const KV = require('./')
const {ID, EMAIL, KEY} = require('./config.json')

const kv = KV(ID, EMAIL, KEY)

test('KV', async t => {
	try {
		const title = 'asdf123'
		const newTitle = 'asdf1234'
		const authkey = 'kajsfhskajfh'

		const namespace = await kv.createNamespace('asdf123')
		t.equal(namespace.title, title, 'new namespaces should have a title')
		t.ok(namespace.id, 'new namespaces should have an id')

		await kv.writeKey(namespace.id, 'jdoe', {name: 'John Doe', age: 34})
		const esundahl = await kv.readKey(namespace.id, 'jdoe')
		t.equal(esundahl.name, 'John Doe', 'Should have the proper name property')
		t.equal(esundahl.age, 34, 'Should have the proper age property')

		await kv.writeKey(namespace.id, 'authkey', authkey)
		const key = await kv.readKey(namespace.id, 'authkey')
		t.equal(key, authkey, 'should properly store and read strings')

		await kv.writeKey(namespace.id, 'foo/bar', 'hello')
		await kv.writeKey(namespace.id, 'foo/baz', 'world')
		const keys = await kv.listKeys(namespace.id)
		console.log(keys)

		const foo = await kv.readKey(namespace.id, 'foo/*')
		console.log(foo)

		const renamed = await kv.renameNamespace(namespace.id, newTitle)
		t.equal(renamed.id, namespace.id, 'Should return an id property after rename')
		t.equal(renamed.title, newTitle, 'Shoud return the new title property after rename')

		await kv.removeNamespace(namespace.id)
		const namespaces = await kv.listNamespaces()
		const missing = namespaces.find(n => n.id === namespace.id)
		t.notOk(missing, 'Should have successfully removed the namespace')
	} catch (e) { console.log(JSON.stringify(e)) }

})
