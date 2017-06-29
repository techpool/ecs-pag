module.exports = {

	'/pratilipi/cover': {
		'GET': { 'path': '/image/pratilipi/cover', 'auth': false }
	},

	'/author/image': {
		'GET': { 'path': '/image/author/profile', 'auth': false }
	},

	'/author/cover': {
		'GET': { 'path': '/image/author/cover', 'auth': false }
	},

	'/image/author/cover': {
		'GET': { 'path': '/image/author/cover', 'auth': false }
	},

	'/search': {
		'GET': { 'path': '/search/search', 'auth': true }
	},

	'/search/search': {
		'GET': { 'path': '/search/search', 'auth': true }
	},

	'/search/trending_search': {
		'GET': { 'path': '/search/trending_search', 'auth': true }
	},

	'/recommendation/pratilipis': {
		'GET': { 'path': '/recommendation/pratilipis', 'auth': true }
	},

	'/pages': {
		'GET': { 'path': '/pages', 'auth': true }
	},

	'/pratilipis': {
		'GET': { 'path': '/pratilipis', 'auth': false }
	},

	'/authors': {
		'GET': { 'path': '/authors', 'auth': false }
	}

};
