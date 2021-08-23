# Bundle Product Extension Plugin
This plugin extends default product with bundle product information.
When fetching product either by SearchClient or ProductService if product is part
of a defined bundle, bundle information will be appended to the simple product.

Additional bundle information can be used for rendering bundle options or overriding 
product sku.

## Transformer

#### Decorate simple with bundle product
Plugin uses API Product Transformer to hook-in after product fetch. It will assign 
bundle product to the `bundle` property in product object.
e.g.

<img width="600" height="400" src="https://i.ibb.co/KKxNTSn/Zrzut-ekranu-2021-08-23-o-16-50-54.png" />


#### Decorate bundle with simple product
Plugin also supports reversed relation between bundle and simple. In this way bundle 
will be decorated with a simple product which is a main bundle option.
Simple product will be assigned in `simple` property in a bundle product.

## Entry point
Entry point for plugin is a /src/index.js file. It contains a template function
for api plugin.

