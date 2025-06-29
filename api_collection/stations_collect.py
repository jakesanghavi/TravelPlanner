from meteostat import Normals, Stations
import pandas as pd

# Get all stations' info
stations = Stations()
all_stations = stations.fetch().reset_index()

# Holder to store climate normals
all_normals = []

# Loop through every station and get the info if it exists
for _, station in all_stations.iterrows():
    try:
        normals = Normals(station['id']).fetch().reset_index()[['month', 'tavg', 'prcp']]
        normals['station_name'] = station['name']
        normals['station_id'] = station['id']
        normals['station_lat'] = station['latitude']
        normals['station_long'] = station['longitude']
        normals['elevation'] = station['elevation']
        all_normals.append(normals)
    except Exception as e:
        print(e)
        pass

# Create the DF
all_normals_df = pd.concat(all_normals, ignore_index=True)

### WRITE TO CSV IF DESIRED
ALL_NORMALS_PATH = "[PLACEHOLDER].csv"
all_normals_df.to_csv(ALL_NORMALS_PATH, index=False)