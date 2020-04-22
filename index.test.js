const test = require('blue-tape')
const KV = require('./')
const {ID, EMAIL, KEY} = require('./config.json')

const kv = KV(ID, EMAIL, KEY)
const title = 'test-cloudflare-kv'
const newTitle = 'test-cloudflare-kv-rename'
const authkey = 'kajsfhskajfh'

test('KV', async t => {
	try {
		await clean()

		const namespace = await kv.createNamespace(title)
		t.equal(namespace.title, title, 'new namespaces should have a title')
		t.ok(namespace.id, 'new namespaces should have an id')

		await kv.put(namespace.id, 'jdoe', {name: 'John Doe', age: 34})
		const esundahl = await kv.get(namespace.id, 'jdoe')
		t.equal(esundahl.name, 'John Doe', 'Should have the proper name property')
		t.equal(esundahl.age, 34, 'Should have the proper age property')

		await kv.put(namespace.id, 'authkey', authkey)
		const key = await kv.get(namespace.id, 'authkey')
		t.equal(key, authkey, 'should properly store and read strings')

		await kv.put(namespace.id, 'foo', 'Erik')
		await kv.put(namespace.id, 'foo/bar', 'hello')
		await kv.put(namespace.id, 'foo/baz', 'world')
		const keys = await kv.list(namespace.id)

		const foo = await kv.list(namespace.id, {prefix: 'foo'})
	
		const renamed = await kv.renameNamespace(namespace.id, newTitle)
		t.equal(renamed.id, namespace.id, 'Should return an id property after rename')
		t.equal(renamed.title, newTitle, 'Shoud return the new title property after rename')

		await kv.removeNamespace(namespace.id)
		const namespaces = await kv.listNamespaces()
		const missing = namespaces.find(n => n.id === namespace.id)
		t.notOk(missing, 'Should have successfully removed the namespace')
	} catch (e) { console.log(JSON.stringify(e)) }

})

test.onFinish(async () => {
	// await clean()
})

function clean() {
	return Promise.all([
		kv.findNamespaceByName(title).then(({id}) => kv.removeNamespace(id)),
		kv.findNamespaceByName(newTitle).then(({id}) => kv.removeNamespace(id))
	])
		.catch(err => Promise.resolve())
}
