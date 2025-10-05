import firebase_admin
from firebase_admin import credentials, db

CERTIFICATE_PATH = ""
DB_URL = ""
REF_PATH = ""
ALL_FIELDS = []
FIELD_TO_UPDATE = ""
VAL_TO_FILL = ""

# Cert info
cred = credentials.Certificate(CERTIFICATE_PATH)
firebase_admin.initialize_app(cred, {
    "databaseURL": DB_URL
})

# Reference collection path
ref = db.reference(REF_PATH)


# Get base nodes
def get_bottom_nodes(ref_node, path=''):
    nodes = []
    data = ref_node.get()
    if not isinstance(data, dict):
        return nodes
    for key, value in data.items():
        current_path = f"{path}/{key}" if path else key
        if isinstance(value, dict):
            # Check if this is a bottom-level node
            if all(k in value for k in ALL_FIELDS):
                nodes.append((current_path, ref_node.child(key)))
            else:
                nodes.extend(get_bottom_nodes(ref_node.child(key), current_path))
    return nodes


bottom_nodes = get_bottom_nodes(ref)


# Update nodes
for path, node_ref in bottom_nodes:
    node_ref.update({FIELD_TO_UPDATE: VAL_TO_FILL})
    print(f"Updated {path}")