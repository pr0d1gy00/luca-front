import { db } from "../../offline/database/schema";
import { queueService } from "../../offline/services/queueService";
import { generateUUID } from "../../offline/utils/uuid";
import type {
  PharmacyInventoryRecord,
  PharmacyInventoryBatchRecord,
  QuoteRequestRecord,
  QuoteOfferRecord,
  PharmacySettingRecord,
  PharmacyOrderRecord,
} from "../../offline/database/schema";

class PharmacyOfflineService {
  // ============================================
  // INVENTORY
  // ============================================
  async getInventory(providerUuid: string): Promise<PharmacyInventoryRecord[]> {
    return db.pharmacyInventories
      .where("providerUuid")
      .equals(providerUuid)
      .toArray();
  }

  async saveInventoryLocally(
    providerUuid: string,
    data: Partial<PharmacyInventoryRecord> & { uuid?: string }
  ): Promise<PharmacyInventoryRecord> {
    const uuid = data.uuid || generateUUID();
    const now = new Date().toISOString();

    const record: PharmacyInventoryRecord = {
      ...data,
      uuid,
      providerUuid,
      medicationUuid: data.medicationUuid || null,
      eanCode: data.eanCode || null,
      activeIngredient: data.activeIngredient || null,
      laboratory: data.laboratory || null,
      saleCondition: data.saleCondition || null,
      stock: data.stock || 0,
      minStockAlert: data.minStockAlert || 10,
      batchNumber: data.batchNumber || null,
      expirationDate: data.expirationDate || null,
      locationRack: data.locationRack || null,
      allowsFractioning: data.allowsFractioning || false,
      unitsPerPackage: data.unitsPerPackage || 1,
      fractionUnitName: data.fractionUnitName || null,
      packageStock: data.packageStock || 0,
      fractionStock: data.fractionStock || 0,
      unitPrice: data.unitPrice || null,
      pricesManual: data.pricesManual || null,
      updatedAt: now,
      _syncStatus: "PENDING",
    };

    await db.pharmacyInventories.put(record);

    await queueService.enqueue({
      entity: "PHARMACY_INVENTORY",
      action: data.uuid ? "UPDATE" : "CREATE",
      payload: record,
    });

    return record;
  }

  // ============================================
  // BATCHES
  // ============================================
  async getBatches(providerUuid: string): Promise<PharmacyInventoryBatchRecord[]> {
    return db.pharmacyInventoryBatches
      .where("providerUuid")
      .equals(providerUuid)
      .toArray();
  }

  async saveBatchLocally(
    providerUuid: string,
    data: Partial<PharmacyInventoryBatchRecord> & { uuid?: string }
  ): Promise<PharmacyInventoryBatchRecord> {
    const uuid = data.uuid || generateUUID();
    const now = new Date().toISOString();

    const record: PharmacyInventoryBatchRecord = {
      ...data,
      uuid,
      providerUuid,
      status: data.status || "PENDING",
      documentUrls: data.documentUrls || null,
      notes: data.notes || null,
      items: data.items || [],
      updatedAt: now,
      _syncStatus: "PENDING",
    };

    await db.pharmacyInventoryBatches.put(record);

    await queueService.enqueue({
      entity: "PHARMACY_BATCH",
      action: data.uuid ? "UPDATE" : "CREATE",
      payload: record,
    });

    return record;
  }

  // ============================================
  // QUOTES
  // ============================================
  async getQuoteRequests(providerUuid: string): Promise<QuoteRequestRecord[]> {
    // In a real scenario, requests are synced down to the provider, but we query locally
    return db.quoteRequests.toArray(); 
  }

  async saveQuoteOfferLocally(
    quoteRequestUuid: string,
    providerUuid: string,
    data: Partial<QuoteOfferRecord> & { uuid?: string }
  ): Promise<QuoteOfferRecord> {
    const uuid = data.uuid || generateUUID();
    const now = new Date().toISOString();

    const record: QuoteOfferRecord = {
      ...data,
      uuid,
      quoteRequestUuid,
      providerUuid,
      status: data.status || "PENDING",
      price: data.price || 0,
      currency: data.currency || "USD",
      availability: data.availability || null,
      comments: data.comments || null,
      items: data.items || [],
      updatedAt: now,
      _syncStatus: "PENDING",
    };

    await db.quoteOffers.put(record);

    await queueService.enqueue({
      entity: "QUOTE_OFFER",
      action: data.uuid ? "UPDATE" : "CREATE",
      payload: record,
    });

    return record;
  }

  // ============================================
  // SETTINGS
  // ============================================
  async getSettings(providerUuid: string): Promise<PharmacySettingRecord | undefined> {
    return db.pharmacySettings.where("providerUuid").equals(providerUuid).first();
  }

  async saveSettingsLocally(
    providerUuid: string,
    data: Partial<PharmacySettingRecord> & { uuid?: string }
  ): Promise<PharmacySettingRecord> {
    const uuid = data.uuid || generateUUID();
    const now = new Date().toISOString();

    const record: PharmacySettingRecord = {
      ...data,
      uuid,
      providerUuid,
      settings: data.settings || {},
      location: data.location,
      updatedAt: now,
      _syncStatus: "PENDING",
    };

    await db.pharmacySettings.put(record);

    await queueService.enqueue({
      entity: "PHARMACY_SETTINGS",
      action: "UPDATE",
      payload: record,
    });

    return record;
  }

  // ============================================
  // ORDERS
  // ============================================
  async getOrders(providerUuid: string): Promise<PharmacyOrderRecord[]> {
    return db.pharmacyOrders.where("providerUuid").equals(providerUuid).toArray();
  }

  async saveOrderLocally(
    providerUuid: string,
    data: Partial<PharmacyOrderRecord> & { uuid?: string }
  ): Promise<PharmacyOrderRecord> {
    const uuid = data.uuid || generateUUID();
    const now = new Date().toISOString();

    const record: PharmacyOrderRecord = {
      ...data,
      uuid,
      providerUuid,
      quoteOfferId: data.quoteOfferId || null,
      patientAccountId: data.patientAccountId || null,
      status: data.status || "PENDING",
      selectedCurrencyPayment: data.selectedCurrencyPayment || null,
      stockDeducted: data.stockDeducted || false,
      confirmedAt: data.confirmedAt || null,
      updatedAt: now,
      _syncStatus: "PENDING",
    };

    await db.pharmacyOrders.put(record);

    await queueService.enqueue({
      entity: "PHARMACY_ORDER",
      action: data.uuid ? "UPDATE" : "CREATE",
      payload: record,
    });

    return record;
  }

  // ============================================
  // SYNC UTILS (Used when online API succeeds)
  // ============================================
  async saveLocalSynced<T extends { uuid: string }>(
    table: "pharmacyInventories" | "pharmacyInventoryBatches" | "quoteRequests" | "quoteOffers" | "pharmacySettings" | "pharmacyOrders",
    data: T | T[]
  ): Promise<void> {
    const items = Array.isArray(data) ? data : [data];
    if (items.length === 0) return;

    const now = new Date().toISOString();
    const records = items.map(item => ({
      ...item,
      updatedAt: now,
      _syncStatus: "SYNCED" as const,
    }));

    await db.table(table).bulkPut(records);
  }
}

export const pharmacyOfflineService = new PharmacyOfflineService();
