class Controller {
    success(res, message) {
        return res.status(200).json(message);
    }

    showError(res, code, message) {
        return res.status(code).json({ error: message ? message : this.errorMessage(code) });
    }

    errorMessage(code) {
        switch (code) {
            case 400:
                return "Bad Request";
            case 401:
                return "Unauthorized";
            case 404:
                return "Not Found";
            case 500:
                return "Internal Server Error";
            default:
                return "Internal Server Error";
        }
    }
}

export default Controller;
