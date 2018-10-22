# tubs-server
1. Uses firebase as db.

CRUD functions ,test on ARC
// products collections api
a. GET /api/products --gets all products list

b. POST /api/products ,creates new product record {"product_name":"", "cost_price":"", "quantity":"", "unit_price":""}

c. GET /api/products/name - (products?name=tubs+bidet+seat+D) -search products using product name(e.g. tubs bidet seat D)

d.PUT /api/products/:id --updates existing product record 

e.DELETE /api/products/:id  ---deletes a product record

f.POST /api/products/:id  -- edits existing product with specified id


// invoice collection api
a.GET /api/invoice ---query invoice collection

b.POST /api/invoice -- creates and save new invoice

c.PUT /api/invoice/:id ----for updating invoice  status(true=paid, false=waitingpayment) with id

d. // DELETE method is not allowed for invoice collection

3. Media Storage
 a.file upload - POST /api/file/upload, body-content-type = multipart/form-data

 
