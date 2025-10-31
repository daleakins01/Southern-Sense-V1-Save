Product Template for Firestore

Use this template as a guide every time you add a new product to the products collection in your Firestore database. This ensures that every product has the correct fields and data types, which is essential for the website to function correctly.

Instructions

In your Firestore products collection, click "+ Add document".

Create a unique Document ID (e.g., new-candle-scent-candle).

Add each field from the list below, paying close attention to the Required Type.

Master Field List

Field Name

Required Type

Description & Example

name

string

The full name of the product. (e.g., Summer Peach Tea)

shortDescription

string

A brief, one-sentence summary for the shop page. (e.g., Juicy peaches and sweet tea on a warm afternoon.)

longDescription

string

The detailed description for the product page. Use <p> tags for paragraphs. (e.g., <p>Capture the essence of a perfect summer day...</p>)

price

string

The price of the item, formatted as a string with two decimal places. (e.g., 20.00 or 9.00)

stock

number

(Crucial) The number of items available. Must be a number. (e.g., 15)

imageUrl

string

The filename of the product's image. (e.g., summer-peach-tea.jpg)

category

string

The type of product. Must be candle or wax-melt.

scentFamily

string

The general scent category. Must be fruity-sweet, earthy-woody, or floral-fresh.

scentNotes

string

A comma-separated list of the key fragrance notes. (e.g., Ripe Peach, Black Tea, Sugar Cane, a hint of Vanilla)

strength

string

The perceived strength of the scent. Must be subtle, moderate, or strong.

featured

boolean

(Crucial) Set to true if this is the "Scent of the Month" for the homepage, otherwise false. Must be a boolean.

pairing

string

A creative suggestion for enjoying the scent. (e.g., Best enjoyed on a front porch swing with a tall glass of iced tea...)