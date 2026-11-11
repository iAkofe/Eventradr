// Location service module for Eventradr.
//
// Contract source: Postman "Locations" folder.
//   GET {{baseUrl}}/locations -> { status, message: "locations", data: LocationState[] }
//
// The route is documented but NOT yet deployed on staging: a live probe of
// GET /api/v1/locations answers `404 NOT_FOUND` ("route not found"). So this
// module calls the live route and, only while it is missing, falls back to a
// bundled snapshot of the documented dataset. The snapshot below is copied
// verbatim from the Postman example response — no IDs are invented, and its
// area IDs match the documented create/update event payloads. Once the route
// ships, callers switch to live data automatically.

import { ApiError, apiFetch } from "@/lib/api/client";
import type { ApiSuccess, LocationState } from "@/lib/api/types";

/** GET /api/v1/locations — the state -> city -> area tree used to pick `areaId`. */
export function fetchLocations() {
  return apiFetch<ApiSuccess<LocationState[]>>("/api/v1/locations");
}

/**
 * Documented location tree (Postman example response), used until
 * GET /api/v1/locations is deployed. Do not edit the IDs.
 */
export const LOCATION_FALLBACK: LocationState[] = [
  {
    id: "01a1491e-e413-7d93-9aa2-f0dfda91f220",
    slug: "lagos",
    name: "Lagos",
    cities: [
      {
        id: "01a1491e-e415-730b-990a-5af1da008300",
        slug: "lagos",
        name: "Lagos",
        areas: [
          { id: "01a1491e-e416-797a-94f2-85999f6c5f10", slug: "agege", name: "Agege" },
          { id: "01a1491e-e416-7ded-88f6-8f2fe55a227f", slug: "agungi", name: "Agungi" },
          { id: "01a1491e-e416-70c6-95cb-36d831f33154", slug: "ajah", name: "Ajah" },
          { id: "01a1491e-e416-7dc6-9155-1240ddd42416", slug: "akoka", name: "Akoka" },
          { id: "01a1491e-e416-7db7-805e-0d797345d3da", slug: "alimosho", name: "Alimosho" },
          { id: "01a1491e-e416-74d7-9eba-8b823936e341", slug: "allen", name: "Allen" },
          { id: "01a1491e-e416-743d-b806-708a5cb6b567", slug: "amuwo-odofin", name: "Amuwo-Odofin" },
          { id: "01a1491e-e416-70b2-8c27-5c86c47e0702", slug: "anthony", name: "Anthony" },
          { id: "01a1491e-e416-7164-aae2-e07d64bd9539", slug: "apapa", name: "Apapa" },
          { id: "01a1491e-e416-7204-9435-acfa8df0aebb", slug: "awoyaya", name: "Awoyaya" },
          { id: "01a1491e-e416-7503-80c2-d8025a8da09b", slug: "badagry", name: "Badagry" },
          { id: "01a1491e-e416-7b1a-b629-ff9a2e3ea5ae", slug: "banana-island", name: "Banana Island" },
          { id: "01a1491e-e416-7a3b-9994-3c43dbd7dcd6", slug: "bariga", name: "Bariga" },
          { id: "01a1491e-e416-7b9b-bd7a-0a8f60807c57", slug: "chevron", name: "Chevron" },
          { id: "01a1491e-e416-7ec5-8153-8e1773d9f71d", slug: "ebute-metta", name: "Ebute Metta" },
          { id: "01a1491e-e416-70e2-9243-084f0c3cf7f7", slug: "egbeda", name: "Egbeda" },
          { id: "01a1491e-e416-7d2c-ae22-ac11e30e6a8d", slug: "eko-atlantic", name: "Eko Atlantic" },
          { id: "01a1491e-e416-7dd8-844c-4b7f3156c4c0", slug: "epe", name: "Epe" },
          { id: "01a1491e-e416-7e29-8a56-c14973ec23ce", slug: "festac", name: "Festac" },
          { id: "01a1491e-e416-7d27-8bdb-adc86549304c", slug: "gbagada", name: "Gbagada" },
          { id: "01a1491e-e416-7cc3-b6c8-1b198cb083b2", slug: "ibeju-lekki", name: "Ibeju-Lekki" },
          { id: "01a1491e-e416-740e-a804-099a890f7db1", slug: "ikate", name: "Ikate" },
          { id: "01a1491e-e416-78fd-a7d2-598540a25a5e", slug: "ikeja", name: "Ikeja" },
          { id: "01a1491e-e416-728e-a3d7-46995dcbc91a", slug: "ikeja-gra", name: "Ikeja GRA" },
          { id: "01a1491e-e416-7883-8331-1e30b91d9344", slug: "ikorodu", name: "Ikorodu" },
          { id: "01a1491e-e416-754b-9ec1-77e5ed7cdc11", slug: "ikotun", name: "Ikotun" },
          { id: "01a1491e-e416-772d-aee5-3745dbca470c", slug: "ikoyi", name: "Ikoyi" },
          { id: "01a1491e-e416-765f-a514-f720fe6d6390", slug: "ilupeju", name: "Ilupeju" },
          { id: "01a1491e-e416-7893-b5a9-27c403d8f9ee", slug: "isolo", name: "Isolo" },
          { id: "01a1491e-e416-7d69-a5fe-68d3450ccf5b", slug: "ketu", name: "Ketu" },
          { id: "01a1491e-e416-701a-9a7d-94081ade390a", slug: "lagos-island", name: "Lagos Island" },
          { id: "01a1491e-e416-79be-b516-973d87a93266", slug: "lekki", name: "Lekki" },
          { id: "01a1491e-e416-7421-b2fe-52e8646e08d7", slug: "lekki-phase-1", name: "Lekki Phase 1" },
          { id: "01a1491e-e416-7786-ad8f-fcc65d2f782f", slug: "magodo", name: "Magodo" },
          { id: "01a1491e-e416-714a-84b5-25c425ed9767", slug: "maryland", name: "Maryland" },
          { id: "01a1491e-e416-7275-b849-4e25e88ba1f5", slug: "mushin", name: "Mushin" },
          { id: "01a1491e-e416-7538-b2eb-11e6f488df28", slug: "obalende", name: "Obalende" },
          { id: "01a1491e-e416-7dcb-80dd-f1583b912763", slug: "ogba", name: "Ogba" },
          { id: "01a1491e-e416-71b0-bada-10493fd448fb", slug: "ogudu", name: "Ogudu" },
          { id: "01a1491e-e416-76b1-97ff-ec6dda6526af", slug: "ojo", name: "Ojo" },
          { id: "01a1491e-e416-7577-8a71-496c32eaa8dd", slug: "ojodu", name: "Ojodu" },
          { id: "01a1491e-e416-7e6e-a2fb-a4cb45e6b28b", slug: "ojota", name: "Ojota" },
          { id: "01a1491e-e416-7754-acea-b775d9b5ada7", slug: "oniru", name: "Oniru" },
          { id: "01a1491e-e416-7899-9036-ca205cc35a54", slug: "opebi", name: "Opebi" },
          { id: "01a1491e-e416-71d7-8cb5-497cc91acf30", slug: "oregun", name: "Oregun" },
          { id: "01a1491e-e416-700f-a8c4-931db65f0c4c", slug: "osapa-london", name: "Osapa London" },
          { id: "01a1491e-e416-7940-95a4-73b8308bb79a", slug: "oshodi", name: "Oshodi" },
          { id: "01a1491e-e416-7d5f-bd81-261f52059aae", slug: "palmgrove", name: "Palmgrove" },
          { id: "01a1491e-e416-7385-8c16-1d963be5e3d6", slug: "sangotedo", name: "Sangotedo" },
          { id: "01a1491e-e416-7226-95ec-783c2f7d86f1", slug: "shomolu", name: "Shomolu" },
          { id: "01a1491e-e416-7c8b-bcbe-53127ca06cfc", slug: "surulere", name: "Surulere" },
          { id: "01a1491e-e416-7ec8-bd29-595dd09fb33d", slug: "victoria-island", name: "Victoria Island" },
          { id: "01a1491e-e416-741e-b8a0-dcef8e5d9154", slug: "yaba", name: "Yaba" },
        ],
      },
    ],
  },
];

/**
 * Locations for the event form. Prefers the live route and falls back to the
 * bundled snapshot only while the route is missing (404 NOT_FOUND), so it
 * starts using live data on its own once the backend ships the endpoint.
 */
export async function listLocations(): Promise<LocationState[]> {
  try {
    const response = await fetchLocations();
    return response.data;
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      return LOCATION_FALLBACK;
    }
    throw error;
  }
}
