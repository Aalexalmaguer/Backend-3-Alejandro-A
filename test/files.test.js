import { expect } from 'chai';
import mongoose from 'mongoose';
import { api, createValidUser } from './helpers.js';

// Un PDF mínimo válido en memoria (no se toca el disco real del proyecto:
// en test los archivos van a la carpeta descartable uploads-test/).
const pdfBuffer = Buffer.from('%PDF-1.4\n%mock\n1 0 obj<<>>endobj\ntrailer<<>>\n%%EOF');

describe('Carga de archivos (M7)', () => {
  describe('Documentos de usuario', () => {
    it('POST /api/users/:id/documents sube un documento y guarda sus metadatos', async () => {
      const user = await createValidUser();
      const res = await api()
        .post(`/api/users/${user._id}/documents`)
        .field('documentType', 'user_document')
        .attach('file', pdfBuffer, { filename: 'dni.pdf', contentType: 'application/pdf' });

      expect(res.status).to.equal(201);
      expect(res.body.status).to.equal('success');
      const doc = res.body.payload.document;
      expect(doc).to.include.keys('originalName', 'filename', 'path', 'mimetype', 'size', 'documentType', 'uploadedAt');
      expect(doc.originalName).to.equal('dni.pdf');
      expect(doc.documentType).to.equal('user_document');
      // El usuario quedó con el documento asociado (solo metadatos).
      expect(res.body.payload.user.documents).to.be.an('array').with.lengthOf(1);
    });

    it('error cuando falta el archivo → 400 FILE_REQUIRED', async () => {
      const user = await createValidUser();
      const res = await api()
        .post(`/api/users/${user._id}/documents`)
        .field('documentType', 'user_document');

      expect(res.status).to.equal(400);
      expect(res.body.error.code).to.equal('FILE_REQUIRED');
    });

    it('error con tipo de documento inválido → 400 INVALID_DOCUMENT_TYPE', async () => {
      const user = await createValidUser();
      const res = await api()
        .post(`/api/users/${user._id}/documents`)
        .field('documentType', 'tipo_raro')
        .attach('file', pdfBuffer, { filename: 'dni.pdf', contentType: 'application/pdf' });

      expect(res.status).to.equal(400);
      expect(res.body.error.code).to.equal('INVALID_DOCUMENT_TYPE');
    });

    it('error con tipo de archivo no permitido → 400 INVALID_FILE_TYPE', async () => {
      const user = await createValidUser();
      const res = await api()
        .post(`/api/users/${user._id}/documents`)
        .field('documentType', 'user_document')
        .attach('file', Buffer.from('texto plano'), { filename: 'nota.txt', contentType: 'text/plain' });

      expect(res.status).to.equal(400);
      expect(res.body.error.code).to.equal('INVALID_FILE_TYPE');
    });

    it('error cuando el usuario no existe → 404 USER_NOT_FOUND', async () => {
      const id = new mongoose.Types.ObjectId().toString();
      const res = await api()
        .post(`/api/users/${id}/documents`)
        .field('documentType', 'user_document')
        .attach('file', pdfBuffer, { filename: 'dni.pdf', contentType: 'application/pdf' });

      expect(res.status).to.equal(404);
      expect(res.body.error.code).to.equal('USER_NOT_FOUND');
    });
  });

  describe('Comprobantes de pedidos', () => {
    it('POST /api/orders/:id/receipts asocia un comprobante al pedido', async () => {
      const user = await createValidUser();
      const order = (
        await api().post('/api/orders').send({
          customer: user._id,
          deliveryAddress: 'Calle 1',
          items: [{ name: 'Caja', quantity: 1, price: 100 }]
        })
      ).body.payload;

      const res = await api()
        .post(`/api/orders/${order._id}/receipts`)
        .attach('file', pdfBuffer, { filename: 'comprobante.pdf', contentType: 'application/pdf' });

      expect(res.status).to.equal(201);
      expect(res.body.payload.receipt.documentType).to.equal('delivery_proof');
      expect(res.body.payload.order.receipts).to.have.lengthOf(1);
    });

    it('error cuando el pedido no existe → 404 ORDER_NOT_FOUND', async () => {
      const id = new mongoose.Types.ObjectId().toString();
      const res = await api()
        .post(`/api/orders/${id}/receipts`)
        .attach('file', pdfBuffer, { filename: 'comprobante.pdf', contentType: 'application/pdf' });

      expect(res.status).to.equal(404);
      expect(res.body.error.code).to.equal('ORDER_NOT_FOUND');
    });
  });
});
