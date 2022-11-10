const { promises: fs } = require('fs')

class Contenedor {
    constructor(archivo) {
        this.archivo = archivo;
    }

    async write(datos, msg) {
        try {
            await fs.writeFile(this.archivo, JSON.stringify(datos, null, 2));
            console.log(msg);
        } catch (err) {
            throw Error(`Error al escribir en el archivo ${err}`);
        }
    }

    async save(element) {
        try {
            const elements = await this.getAll()

            const id = elements.length === 0 ? 1 : elements[elements.length - 1].id + 1
            element.id = id;
            elements.push(element);

            await this.write(elements, 'Agregado!');

            return element.id

        } catch (err) {
            throw Error(`Error Save ${err}`);
        }
    }

    async getById(myId) {
        let datos = await this.getAll();

        let result = datos.filter(product => product.id == myId);
        return result;
    }

    async getAll() {
        try {
            const file = await fs.readFile(this.archivo, 'utf-8')
            const elements = JSON.parse(file)
            return elements;

        } catch (err) {
            throw Error(`Error al leer el archivo ${err}`);
        }
    }

    async deleteById(myId) {
        let datos = await this.getAll();

        let product = datos.find(product => product.id == myId);
        if (product) {
            let index = datos.indexOf(product);
            console.log(index);
            datos.splice(index, 1);
            await this.write(datos, `Producto con ID: ${myId} eliminado`)
        } else {
            console.log(`Producto con ID: ${myId} no existe`);
        }
    }
}
module.exports = Contenedor;