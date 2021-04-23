import CollectionController from "./CollectionController.js";
const collection = new CollectionController();

// GET:
export const getAllCollections = (req, res) => {
    collection.getAllCollections(req, res);
};

export const getCollectionById = (req, res) => {
    collection.getCollectionById(req, res);
};
