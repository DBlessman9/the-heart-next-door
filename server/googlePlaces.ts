// Google Places API service for finding local maternal health resources

interface PlaceResult {
  name: string;
  place_id: string;
  formatted_address?: string;
  formatted_phone_number?: string;
  website?: string;
  rating?: number;
  types?: string[];
  business_status?: string;
}

interface PlacesSearchResponse {
  results: Array<{
    name: string;
    place_id: string;
    formatted_address?: string;
    vicinity?: string;
    rating?: number;
    types?: string[];
    business_status?: string;
  }>;
  status: string;
  next_page_token?: string;
}

interface PlaceDetailsResponse {
  result: PlaceResult;
  status: string;
}

// Map Google Places types to our resource topics
const RESOURCE_TYPE_MAPPING: Record<string, string> = {
  "doula": "doula",
  "midwife": "healthcare",
  "midwifery": "healthcare",
  "birth center": "birth_center",
  "birthing center": "birth_center",
  "lactation": "breastfeeding",
  "breastfeeding": "breastfeeding",
  "postpartum": "wellness",
  "maternal": "healthcare",
  "pregnancy": "wellness",
  "prenatal": "wellness",
  "ob-gyn": "healthcare",
  "obstetrician": "healthcare",
  "women's health": "healthcare",
};

// Search queries for maternal health resources
const MATERNAL_HEALTH_QUERIES = [
  { query: "doula services", topic: "doula" },
  { query: "midwife midwifery", topic: "healthcare" },
  { query: "birth center birthing center", topic: "birth_center" },
  { query: "lactation consultant breastfeeding support", topic: "breastfeeding" },
  { query: "postpartum support group", topic: "wellness" },
  { query: "prenatal yoga pregnancy wellness", topic: "wellness" },
];

export class GooglePlacesService {
  private apiKey: string;
  private baseUrl = "https://maps.googleapis.com/maps/api/place";

  constructor() {
    this.apiKey = process.env.GOOGLE_API_KEY || "";
    if (!this.apiKey) {
      console.warn("GOOGLE_API_KEY not set - Google Places integration disabled");
    }
  }

  isConfigured(): boolean {
    return !!this.apiKey;
  }

  // Get coordinates from zip code using Geocoding API
  async getCoordinatesFromZip(zipCode: string): Promise<{ lat: number; lng: number; city: string; state: string } | null> {
    try {
      const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${zipCode}&key=${this.apiKey}`;
      const response = await fetch(url);
      const data = await response.json();

      if (data.status === "REQUEST_DENIED") {
        console.error("Geocoding API not enabled. Please enable the Geocoding API in Google Cloud Console:", data.error_message);
        return null;
      }

      if (data.status === "OK" && data.results.length > 0) {
        const result = data.results[0];
        const location = result.geometry.location;
        
        // Extract city and state from address components
        let city = "";
        let state = "";
        for (const component of result.address_components) {
          if (component.types.includes("locality")) {
            city = component.long_name;
          }
          if (component.types.includes("administrative_area_level_1")) {
            state = component.short_name;
          }
        }

        return { lat: location.lat, lng: location.lng, city, state };
      }
      console.log("Could not geocode zip code:", zipCode, "Status:", data.status);
      return null;
    } catch (error) {
      console.error("Error geocoding zip code:", error);
      return null;
    }
  }

  // Search for places near a location
  async searchPlaces(query: string, lat: number, lng: number, radiusMeters: number = 40000): Promise<PlacesSearchResponse["results"]> {
    try {
      const url = `${this.baseUrl}/textsearch/json?query=${encodeURIComponent(query)}&location=${lat},${lng}&radius=${radiusMeters}&key=${this.apiKey}`;
      const response = await fetch(url);
      const data: PlacesSearchResponse = await response.json();

      if (data.status === "OK") {
        return data.results.filter(place => 
          place.business_status !== "CLOSED_PERMANENTLY"
        );
      }
      return [];
    } catch (error) {
      console.error("Error searching places:", error);
      return [];
    }
  }

  // Get detailed information about a place
  async getPlaceDetails(placeId: string): Promise<PlaceResult | null> {
    try {
      const fields = "name,place_id,formatted_address,formatted_phone_number,website,rating,types";
      const url = `${this.baseUrl}/details/json?place_id=${placeId}&fields=${fields}&key=${this.apiKey}`;
      const response = await fetch(url);
      const data: PlaceDetailsResponse = await response.json();

      if (data.status === "OK") {
        return data.result;
      }
      return null;
    } catch (error) {
      console.error("Error getting place details:", error);
      return null;
    }
  }

  // Determine resource topic from place name and types
  determineTopic(name: string, types?: string[]): string {
    const searchText = name.toLowerCase();
    
    for (const [keyword, topic] of Object.entries(RESOURCE_TYPE_MAPPING)) {
      if (searchText.includes(keyword)) {
        return topic;
      }
    }

    // Check types as fallback
    if (types) {
      if (types.includes("hospital")) return "healthcare";
      if (types.includes("health")) return "wellness";
    }

    return "wellness"; // Default
  }

  // Search for all maternal health resources in an area
  async searchMaternalHealthResources(zipCode: string): Promise<Array<{
    name: string;
    description: string;
    googlePlaceId: string;
    website: string | null;
    contactPhone: string | null;
    address: string;
    city: string;
    state: string;
    topic: string;
    rating: number | null;
  }>> {
    if (!this.isConfigured()) {
      console.warn("Google Places API not configured");
      return [];
    }

    const coords = await this.getCoordinatesFromZip(zipCode);
    if (!coords) {
      console.error("Could not geocode zip code:", zipCode);
      return [];
    }

    const { lat, lng, city, state } = coords;
    const allResults: Map<string, any> = new Map();

    // Search for each type of maternal health resource
    for (const { query, topic } of MATERNAL_HEALTH_QUERIES) {
      try {
        const searchQuery = `${query} near ${city} ${state}`;
        const places = await this.searchPlaces(searchQuery, lat, lng);
        
        for (const place of places.slice(0, 5)) { // Limit to 5 per category
          if (allResults.has(place.place_id)) continue;
          
          // Get additional details
          const details = await this.getPlaceDetails(place.place_id);
          if (!details) continue;

          allResults.set(place.place_id, {
            name: details.name,
            description: `${topic === "doula" ? "Doula services" : 
                          topic === "healthcare" ? "Maternal healthcare provider" :
                          topic === "birth_center" ? "Birth center" :
                          topic === "breastfeeding" ? "Lactation and breastfeeding support" :
                          "Pregnancy and postpartum wellness"} in ${city}, ${state}`,
            googlePlaceId: details.place_id,
            website: details.website || null,
            contactPhone: details.formatted_phone_number || null,
            address: details.formatted_address || place.vicinity || "",
            city,
            state,
            topic: this.determineTopic(details.name, details.types) || topic,
            rating: details.rating ? Math.round(details.rating) : null,
          });
        }

        // Small delay between queries to respect rate limits
        await new Promise(resolve => setTimeout(resolve, 200));
      } catch (error) {
        console.error(`Error searching for ${query}:`, error);
      }
    }

    return Array.from(allResults.values());
  }
}

export const googlePlacesService = new GooglePlacesService();
