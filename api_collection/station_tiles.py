import pandas as pd
import json
import math

# Read in the climate normals
NORMALS_DF_PATH = '[PLACEHOLDER].csv'
df = pd.read_csv(NORMALS_DF_PATH)
df = df.where(pd.notnull(df), None)

# Make a tiling JSON
tiles_data = {}

# Create tile id for a lat long
def get_tile_id(lat, lon, tile_size=1.0):
    lat_tile = math.floor(lat / tile_size)
    lon_tile = math.floor(lon / tile_size)
    return f"{lat_tile}_{lon_tile}"

# Iterate over all stations
for station_id, group in df.groupby('station_id'):
    first_row = group.iloc[0]

    station_lat = first_row['station_lat']
    station_long = first_row['station_long']

    # Handle missing lat/lon just in case
    if station_lat is None or station_long is None:
        continue

    # get relevant station info
    station_info = {
        'station_id': station_id,
        'station_lat': station_lat,
        'station_long': station_long,
        'elevation': first_row['elevation'],
        'station_name': first_row['station_name'],
        'normals': {}
    }

    for _, row in group.iterrows():
        month = str(int(row['month']))
        tavg = row['tavg']
        prcp = row['prcp']

        if isinstance(tavg, float) and math.isnan(tavg):
            tavg = None
        if isinstance(prcp, float) and math.isnan(prcp):
            prcp = None

        station_info['normals'][month] = {
            'tavg': tavg,
            'prcp': prcp
        }

    # get the station tile
    tile_id = get_tile_id(station_lat, station_long)

    if tile_id not in tiles_data:
        tiles_data[tile_id] = {}

    # Add the station tile info to the json
    tiles_data[tile_id][station_id] = station_info

# Write to JSON
with open('tiled_stations.json', 'w') as f:
    json.dump(tiles_data, f, indent=2, allow_nan=False)