/**
 * Plugin extends default product with bundle information
 * @param config
 * @param db
 * @param router
 * @param cache
 * @param apiStatus
 * @param apiError
 * @param getRestApiClient
 * @returns {{router: *, route: string, pluginName: string, domainName: string}}
 */
module.exports = ({ config, db, router, cache, apiStatus, apiError, getRestApiClient, ...props }) => {
    const findBundle = (id) => {
        return new Promise(async (resolve) => {
            const query = { match: { id } };
            const payload = {
                index: `${config.elasticsearch.index}_product`,
                body: { query }
            };
            const esClient = await db.getElasticClient();

            esClient.search(payload, (err, elasticResult) => {
                if (err) {
                    if (props.logger) {
                        props.logger.debug('Cannot find bundle info: ', id, err);
                    } else {
                        console.debug('Cannot find bundle info: ', id, err);
                    }

                    resolve(null);
                } else {
                    const { body } = elasticResult;
                    const { hits: esData } = body;
                    const hits = esData.hits && Array.isArray(esData.hits) ? esData.hits.map(({ _source }) => _source) : [];
                    const [bundle] = hits;
                    resolve(bundle);
                }
            });
        });
    };

    const BundleTransformer = async (products, storeCode) => {
        for (let product of products) {
            if (product.bundle_id) {
                const bundle = await findBundle(product.bundle_id);
                if (bundle) {
                    Object.assign(product, { bundle });
                }
            }
        }

        return products;
    };

    // Register custom product transformer to assign bundle product
    if (props.hasOwnProperty('entityTransformer')) {
        props.entityTransformer.registerProductTransformer(BundleTransformer);
    } else {
        console.debug('Cannot register BundleTransformer. No API support for custom transformers');
    }

    return {
        domainName: '@grupakmk',
        pluginName: 'bundle-product-extension-plugin'
    };
};
