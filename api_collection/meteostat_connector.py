from meteostat import Point, Normals, Stations
import numpy as np
import pandas as pd

# Points every int of lat/long
# Can make more precise later but data size explodes
lat_grid = np.arange(-90, 91, 1)
lon_grid = np.arange(-180, 181, 1)
all_pairs = [(lat, lon) for lat in lat_grid for lon in lon_grid]

# Set periods and other data
period_start = 1991
period_end = 2020
output_dfs = []
stations = Stations()

# Loop through every gridpoint
for loc in all_pairs:
    # Get nearest station to gridpoint
    location = Point(loc[0], loc[1], None)
    station = stations.nearby(loc[0], loc[1]).fetch(1)
    
    # Try to get most recent data for 2 different periods
    # Can extend this to just the full dataset
    # So null start and end if this doesn't work properly
    try:
        data = Normals(station.index[0], period_start, period_end)
    except AttributeError:
        continue
    try:
        data = Normals(station.index[0], period_start-10, period_end-10)
    except AttributeError:
        continue
    try:
        data = data.fetch()
    except TypeError:
        continue
    if data is None or len(data) == 0:
        continue
    # Get the relevant data only and add to the df
    data = data.reset_index()[['month', 'tavg', 'prcp']]
    data['lat'] = loc[0]
    data['long'] = loc[1]
    output_dfs.append(data)

# Stack all the dfs and save
final_df = pd.concat(output_dfs, ignore_index=True)
final_df.to_csv('climate_history.csv', index=False)