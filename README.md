# Bundle Product Extension Plugin
This plugin extends default product with bundle product information.
When fetching product either by SearchClient or ProductService if product is part
of a defined bundle, bundle information will be appended to the simple product.

Additional bundle information can be used for rendering bundle options or overriding 
product sku.

## Transformer
Plugin uses API Product Transformer to hook-in after product fetch. It will assign 
bundle product to the `bundle` property in product object.
e.g.

<img width="600" height="400" src="https://i.ibb.co/KKxNTSn/Zrzut-ekranu-2021-08-23-o-16-50-54.png" />

## Entry point
Entry point for plugin is a /src/index.js file. It contains a template function
for api plugin.

