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
    const findProduct = (identifier, mapBy = 'id', storeCode) => {
        return new Promise(async (resolve) => {
            const defaultStoreCode = config.storeViews.default_store_code;
            const query = { match: { [mapBy]: identifier } };
            const payload = {
                index: !storeCode || storeCode === defaultStoreCode ? `${config.elasticsearch.index}_product` : `${config.elasticsearch.index}_${storeCode}_product`,
                body: { query }
            };
            const esClient = await db.getElasticClient();

            esClient.search(payload, (err, elasticResult) => {
                if (err) {
                    props.logger.debug('Cannot find bundle info: ', `${mapBy}: ${identifier}`, err);
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
        if (products.length > 1) return products;

        for (let product of products) {
            // Create link between simple ---> bundle
            if (product.bundle_id) {
                const bundle = await findProduct(product.bundle_id, null, storeCode);
                if (bundle) {
                    Object.assign(product, {bundle});
                }
            } else {
                // Create reversed link between bundle ---> simple
                if (product.product_option && product.product_option.extension_attributes && product.product_option.extension_attributes.bundle_options) {
                    try {
                        const [option] = product.product_option.extension_attributes.bundle_options;
                        const [selection] = option.option_selections;
                        const simpleProductOption = product.extension_attributes.bundle_product_options.find(opt => String(opt.option_id) === String(option.option_id));
                        const simpleProductLink = simpleProductOption.product_links.find(link => String(link.id) === String(selection));
                        const simple = await findProduct(simpleProductLink.sku, 'sku', storeCode);

                        if (simple) {
                            Object.assign(product, { simple });
                        }
                    } catch (e) {}
                }
            }
        }

        return products;
    };

    // Register custom product transformer to assign bundle product
    props.entityTransformer.registerProductTransformer(BundleTransformer);

    return {
        domainName: '@grupakmk',
        pluginName: 'bundle-product-extension-plugin'
    };
};
