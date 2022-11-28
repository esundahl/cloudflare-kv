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
		const username = await kv.get(namespace.id, 'jdoe')
		t.equal(username.name, 'John Doe', 'Should have the proper name property')
		t.equal(username.age, 34, 'Should have the proper age property')

		await kv.put(namespace.id, 'authkey', authkey)
		const key = await kv.get(namespace.id, 'authkey')
		t.equal(key, authkey, 'should properly store and read strings')

		await kv.put(namespace.id, 'foo', 'Erik')
		await kv.put(namespace.id, 'foo/bar', 'hello')
		await kv.put(namespace.id, 'foo/baz', 'world')
		await kv.put(namespace.id, 'asdf', 'asdf')

		const keys = await kv.list(namespace.id)
		t.ok(keys.find(key => key === 'foo'), 'list should contain foo')
		t.ok(keys.find(key => key === 'foo/bar'), 'list should contain foo/bar')
		t.ok(keys.find(key => key === 'foo/baz'), 'list should contain foo/baz')
		t.ok(keys.find(key => key === 'asdf'), 'list should contain asdf')

		const foo = await kv.list(namespace.id, { prefix: 'foo' })
		t.ok(foo.find(key => key === 'foo'), 'list with prefix should contain foo')
		t.ok(foo.find(key => key === 'foo/bar'), 'list with prefix should contain foo/bar')
		t.ok(foo.find(key => key === 'foo/baz'), 'list with prefix should contain foo/baz')
		t.notOk(foo.find(key => key === 'asdf'), 'list with prefix should not contain asdf')
	
		const renamed = await kv.renameNamespace(namespace.id, newTitle)
		t.equal(renamed.id, namespace.id, 'Should return an id property after rename')
		t.equal(renamed.title, newTitle, 'Shoud return the new title property after rename')

		await kv.removeNamespace(namespace.id)
		const namespaces = await kv.listNamespaces()
		const missing = namespaces.find(n => n.id === namespace.id)
		t.notOk(missing, 'Should have successfully removed the namespace')
	} catch (e) { console.error(e) }

})

test.onFinish(async () => {
	await clean()
})

function clean() {
	return Promise.allSettled([
		kv.findNamespaceByName(title).then(({id}) => kv.removeNamespace(id)),
		kv.findNamespaceByName(newTitle).then(({id}) => kv.removeNamespace(id))
	])
		.catch(err => {
			console.error(err)
			return Promise.resolve()
		})
}
