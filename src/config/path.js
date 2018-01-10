module.exports = {

    // $q => query
    // $qs => querystring
    // $b => body
    // $h => headers

    '^\/reviews\/[0-9]{1,20}\/comments\/[0-9]{1,20}$': {
        POST: {
            type: 'json',
            $q: {
                match: '^\/reviews\/(.*?[0-9]{1,20})\/comments\/(.*?[0-9]{1,20})$',
                group: ['reviewId', 'commentId']
            },
            auth: {
                resource: '/reviews/$q.reviewId/$q.reviewId',
                method: 'GET',
                parentId: '$q.reviewId',
                id: '$q.commentId',
                language: '$b.language',
                test: '$h.test'
            }
        }
    }

};
