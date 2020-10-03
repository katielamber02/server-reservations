import { google } from "googleapis";
import {
  Client,
  AddressComponent,
  AddressType,
  GeocodingAddressComponentType,
} from "@googlemaps/google-maps-services-js";

const maps = new Client({});

const { country, administrative_area_level_1, locality } = AddressType;
const pais = country;
const { postal_town } = GeocodingAddressComponentType;

const parseAddress = (addressComponents: AddressComponent[]) => {
  let country = null;
  let admin = null;
  let city = null;

  for (const component of addressComponents) {
    const { long_name } = component;
    if (component.types.includes(pais)) {
      country = component.long_name;
    }
    if (component.types.includes(administrative_area_level_1)) {
      admin = long_name;
    }
    if (
      component.types.includes(locality) ||
      component.types.includes(postal_town)
    ) {
      city = long_name;
    }
  }
  // console.log("PARSE ADDRESS:", country, admin, city);
  return { country, admin, city };
};

const auth = new google.auth.OAuth2(
  process.env.G_CLIENT_ID,
  process.env.G_CLIENT_SECRET,
  `${process.env.PUBLIC_URL}/login`
);

export const Google = {
  authUrl: auth.generateAuthUrl({
    access_type: "online",
    scope: [
      "https://www.googleapis.com/auth/userinfo.email",
      "https://www.googleapis.com/auth/userinfo.profile",
    ],
  }),

  logIn: async (code: string) => {
    const { tokens } = await auth.getToken(code);

    auth.setCredentials(tokens);

    const { data } = await google.people({ version: "v1", auth }).people.get({
      resourceName: "people/me",
      personFields: "emailAddresses,names,photos",
    });

    return { user: data };
  },

  geocode: async (address: string) => {
    // console.log("GEO address:", address);
    // console.log("KEY", process.env.G_GEOCODE_KEY);
    if (!process.env.G_GEOCODE_KEY) {
      throw new Error("Google Maps Api Key missing or not found");
    }
    const res = await maps.geocode({
      params: { address, key: process.env.G_GEOCODE_KEY },
    });

    // console.log("GEO RESPONSE:", res);
    if (res.status < 200 || res.status > 299) {
      throw new Error("Failed to geocode address");
    }

    return parseAddress(res.data.results[0].address_components);
  },
};
