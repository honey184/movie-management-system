class ApiFeatures {
    constructor(query, queryString) {
        this.query = query;
        this.queryString = queryString;
    }


    search() {
        if (this.queryString.q) {
            this.query = this.query
                .find({ $text: { $search: this.queryString.q } })
                .select({
                    score: { $meta: 'textScore' },
                    title: 1,
                    genre: 1,
                    ratingsAvg: 1,
                    releaseYear: 1
                })
                .sort({ score: { $meta: 'textScore' } });
        }
        return this;
    }


    filter() {
        const queryObj = { ...this.queryString };

        const excludedFields = ['q', 'sort', 'page', 'limit', 'fields'];
        excludedFields.forEach((field) => delete queryObj[field]);


        let queryStr = JSON.stringify(queryObj);
        queryStr = queryStr.replace(/\b(gte|lte|gt|lt)\b/g, (match) => `$${match}`);

        this.query = this.query.find(JSON.parse(queryStr));
        return this;
    }


    sort() {

        const allowedSortFields = [
            "releaseYear",
            "ratingAvg",
            "ratingsCount",
        ];

        if (this.queryString.sort) {

            const fields = this.queryString.sort.split(",");

            const invalidFields = fields.filter(field => {
                const cleanField = field.replace("-", "");
                return !allowedSortFields.includes(cleanField);
            });

            if (invalidFields.length > 0) {
                const error = new Error(`Invalid sort field: ${invalidFields.join(", ")}`);
                error.statusCode = 400;
                throw error;
            }

            const sortBy = fields.join(" ");
            this.query = this.query.sort(sortBy);

        } else {
            this.query = this.query.sort("-releaseYear");
        }

        return this;
    }


    limitFields() {

        if (this.queryString.fields) {

            const requestedFields = this.queryString.fields.split(',');

            // get allowed schema fields
            const allowedFields = Object.keys(this.query.model.schema.paths);

            // check for invalid fields
            const invalidFields = requestedFields.filter(field => {
                const cleanField = field.replace('-', '');
                return !allowedFields.includes(cleanField);
            });

            if (invalidFields.length > 0) {
                const error = new Error(`Invalid field selection: ${invalidFields.join(', ')}`);
                error.statusCode = 400;
                throw error;
            }

            const fields = requestedFields.join(' ');
            this.query = this.query.select(fields);

        }

        return this;
    }


    paginate() {
        const page = parseInt(this.queryString.page, 10) || 1;
        let limit = parseInt(this.queryString.limit, 10) || 20;

        const MAX_LIMIT = 20;
        limit = Math.min(limit, MAX_LIMIT);

        const skip = (page - 1) * limit;

        this.query = this.query.skip(skip).limit(limit);

        this.pagination = { page, limit, skip };
        return this;
    }
}

module.exports = ApiFeatures;