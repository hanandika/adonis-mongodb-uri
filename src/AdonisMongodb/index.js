/**
 * adonis-mongodb is a provider that gives you power to use MongoDB whitout limitation
 *
 * @constructor
 * @singleton
 * @uses (['Adonis/Src/Config'])
 *
 * @class AdonisMongodb
 */
class AdonisMongodb {
    constructor({ Config, MongoClient, ObjectID }) {
        this.Config = Config;
        this.ObjectID = ObjectID;
        this.host = this.Config.get('mongodb.host');
        this.hosts_replicaset = this.Config.get('mongodb.hosts_replicaset');
        this.port = this.Config.get('mongodb.port');
        this.username = this.Config.get('mongodb.username');
        this.password = this.Config.get('mongodb.password');
        this.dbName = this.Config.get('mongodb.database');
        this.options = this.Config.get('mongodb.options');
        this.uri = this.Config.get('mongodb.uri');
        if (this.username && this.password !== null && this.options.authSource) {
            this.url = `mongodb://${this.username}:${this.password}@${this.host}:${this.port}/${this.dbName}?authSource=${this.options.authSource}`;
        }
        if (this.username && this.password !== null && !this.options.authSource) {
            this.url = `mongodb://${this.username}:${this.password}@${this.host}:${this.port}/${this.dbName}`;
        }
        if (!this.username && !this.password) {
            this.url = `mongodb://${this.host}:${this.port}/${this.dbName}`;
        }
        if (this.hosts_replicaset && this.username && this.password && this.options.authSource && this.options.replicaSet) {
            this.url = `mongodb://${this.username}:${this.password}@${this.hosts_replicaset}/${this.dbName}?authSource=${this.options.authSource}&replicaSet=${this.options.replicaSet}`;
        }
        if (this.options.readPreference) {
            this.url += `&readPreference=${this.options.readPreference}`;
        }
        if (this.options.maxStalenessSeconds) {
            this.url += `&maxStalenessSeconds=${this.options.maxStalenessSeconds}`;
        }
        if (this.uri) {
            this.url = this.uri;
        }
        this.Client = MongoClient;
    }

    /**
     * Check if there's existing connections
     *
     * @method isConnected
     *
     * @return {Boolean}
     */
    isConnected() {
        return !!this.db;
    }

    /**
     * Creates a new database connection for the config defined inside
     * `config/mongodb` file. If there's existing connections, this method
     * will reuse and returns it.
     *
     * @method connect
     *
     * @return
     */
    async connect() {
        if (this.isConnected()) {
            console.log('Client is already connected, returning...');
            return this.db;
        }
        await this.Client.connect(this.url, { useNewUrlParser: true }, (err, client) => {
            if (err) {
                throw new Error(err);
            }
            this.db = client.db(null);
            this.Client = client;
            if (this.host && this.port) {
                console.log(`Connected successfully to mongodb ${this.host}:${this.port}/${this.dbName}`);
            }
            if (this.hosts_replicaset) {
                console.log(`Connected successfully to mongodb replica-set ${this.hosts_replicaset}/${this.dbName}`);
            }
            if (this.uri) {
                console.log(`Connected successfully to mongodb provided URI`);
            }
        });
        return this.db;
    }

    /**
     * Closes the connection
     *
     * @method close
     *
     * @return {void}
     */
    close() {
        this.Client.close();
        console.log(`Connection closed successfully.`);
    }

    /**
     * Update a single document
     *
     * @private
     * @param {String} collection
     * @param {Object} document
     */
    async updateDocument(collection, document) {
        const { _id, ...dataToUpdate } = document;
        await this.db.collection(collection).updateOne({ _id: this.ObjectID(_id) }, { $set: { updatedAt: new Date(), ...dataToUpdate } });
        return this.db.collection(collection).findOne({ _id: this.ObjectID(document._id) });
    }

    /**
     * Create a single document
     *
     * @private
     * @param {String} collection
     * @param {Object} document
     */
    async createDocument(collection, document) {
        const documentId = document._id || new this.ObjectID();
        await this.db.collection(collection).insertOne({ createdAt: new Date(), updatedAt: new Date(), ...document, _id: documentId });
        return this.db.collection(collection).findOne({ _id: documentId });
    }

    /**
     * Check if document exists
     * @private
     * @param {String} collection
     * @param {*} _id
     * @returns {Boolean}
     */
    async documentExists(collection, _id) {
        const document = await this.db.collection(collection).findOne({ _id: this.ObjectID(_id) }, { _id: 1 });
        return !!document;
    }

    /**
     * Create or update a single document
     *
     * @param {String} collection
     * @param {Object} document
     */
    async createOrUpdate(collection, document) {
        if (document._id && !this.ObjectID.isValid(document._id)) {
            throw new Error('Invalid ObjectId');
        } else if (document._id && (await this.documentExists(collection, document._id))) {
            return this.updateDocument(collection, document);
        } else {
            return this.createDocument(collection, document);
        }
    }
}

module.exports = AdonisMongodb;
