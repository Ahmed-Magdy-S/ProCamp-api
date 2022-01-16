const advancedResults = (model, populate) => async (req, res, next) => {
    let query;
    const reqQuery = { ...req.query }

    //fields to exclude
    const removedFields = ["select", "sort", "limit", "page"]

    //loop over removedFields and delete them from reqquery
    removedFields.forEach(param => delete reqQuery[param])

    let queryStr = JSON.stringify(reqQuery)


    queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, match => `$${match}`);


    query = model.find(JSON.parse(queryStr))

    //select fields
    if (req.query.select) {
        const fields = req.query.select.split(",").join("  ")
        query = query.select(fields)
    }

    if (req.query.sort) {
        const sortBy = req.query.sort.split(",").join("  ")
        query = query.sort(sortBy)
    } else {
        query = query.sort("-createdAt")
    }

    //pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;
    const lastIndex = page * limit;

    query = query.skip(startIndex).limit(limit)

    if (populate) {
        query.populate(populate)
    }

    const results = await query
    const totalDocs = await model.countDocuments()

    const pagination = {}

    if (lastIndex < totalDocs) {
        pagination.next = {
            page: page + 1,
            limit
        }
    }

    if (startIndex > 0) {
        pagination.prev = {
            page: page - 1,
            limit
        }
    }

    res.advancedResults = {
        success: true,
        count: results.length,
        pagination,
        data: results
    }
    next()
}

module.exports = advancedResults