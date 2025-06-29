import firebase_admin
from firebase_admin import credentials, firestore
import time
import pandas as pd

# Cert file replace w your own
CERT_FILE = "[PLACEHOLDER].json"

# Read data replace w your own
ALL_NORMALS_PATH = "[PLACEHOLDER].csv"

all_normals_df = pd.read_csv(ALL_NORMALS_PATH)

# Initialize the Firebase app
cred = credentials.Certificate(CERT_FILE)
firebase_admin.initialize_app(cred)
db = firestore.client()

batch = db.batch()
batch_size = 0

input_data = all_normals_df.drop_duplicates(['station_id']).reset_index(drop=True)

for index, row in all_normals_df.iterrows():
    doc_id = row['station_id']
    doc_data = row[['station_id', 'station_lat', 'station_long', 'elevation']].dropna().to_dict()
    doc_ref = db.collection("stations").document(doc_id)
    batch.set(doc_ref, doc_data)
    batch_size += 1

    # Commit every 500 writes (Firestore batch limit)
    if batch_size == 500:
        batch.commit()
        batch = db.batch()
        batch_size = 0
        time.sleep(2)

# Commit remaining writes if any
if batch_size > 0:
    batch.commit()