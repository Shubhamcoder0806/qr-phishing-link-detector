import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
import joblib

# Load dataset
df = pd.read_csv('All.csv')

# Define feature columns
features = [
    'query_length', 'domain_token_count', 'path_token_count', 'avg_domain_token_len',
    'long_domain_token_len', 'avg_path_token_len', 'tld', 'charcomp_vowels',
    'charcomp_ace', 'ldl_url', 'ldl_domain', 'ldl_path', 'ldl_filename', 'ldl_getarg',
    'dld_url', 'dld_domain', 'dld_path', 'dld_filename', 'dld_getarg',
    'url_len', 'domain_length', 'path_length', 'subdir_len', 'file_name_len',
    'this_file_ext_len', 'arg_len', 'path_url_ratio', 'arg_url_ratio',
    'arg_domain_ratio', 'domain_url_ratio', 'path_domain_ratio', 'arg_path_ratio',
    'executable', 'is_port_eighty', 'number_of_dots_in_url', 'is_ip_address_in_domain_name',
    'character_continuity_rate', 'longest_variable_value', 'url_digit_count',
    'host_digit_count', 'directory_digit_count', 'file_name_digit_count',
    'extension_digit_count', 'query_digit_count', 'url_letter_count',
    'host_letter_count', 'directory_letter_count', 'filename_letter_count',
    'extension_letter_count', 'query_letter_count', 'longest_path_token_length',
    'domain_longest_word_length', 'path_longest_word_length',
    'sub_directory_longest_word_length', 'arguments_longest_word_length',
    'url_sensitive_word', 'url_queries_variable', 'spchar_url',
    'delimeter_domain', 'delimeter_path', 'delimeter_count',
    'number_rate_url', 'number_rate_domain', 'number_rate_directory_name',
    'number_rate_file_name', 'number_rate_extension', 'number_rate_afterpath',
    'symbol_count_url', 'symbol_count_domain', 'symbol_count_directory_name',
    'symbol_count_file_name', 'symbol_count_extension', 'symbol_count_afterpath',
    'entropy_url', 'entropy_domain', 'entropy_directory_name',
    'entropy_filename', 'entropy_extension', 'entropy_afterpath',
    'url_type_obf_type'
]

# Check which features are missing from the DataFrame
missing = [col for col in features if col not in df.columns]
if missing:
    print("Warning: The following features are missing from the dataset and will be ignored:")
    print(missing)

# Use only available features
available_features = [col for col in features if col in df.columns]
if not available_features:
    raise ValueError("None of the specified features are present in the dataset.")

X = df[available_features]

# Encode target labels (e.g., 'malicious', 'benign') as integers
if 'type' in df.columns:
    y = df['type'].map({'malicious': 1, 'benign': 0, 'phishing': 1, 'suspicious': 1, 'legitimate': 0})
    if y.isnull().all():
        raise ValueError("No valid target labels found in the 'type' column. Check your label values.")
else:
    raise ValueError("The dataset does not contain a 'type' column for target labels.")

# Drop rows with missing target values
mask = y.notnull()
X = X[mask]
y = y[mask]

# Fill missing values in features if any
X = X.fillna(0)

# Check if there is enough data to train
if X.empty or y.empty:
    raise ValueError("No data available for training after filtering. Check your dataset and feature selection.")

# Train/test split
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# Train classifier
model = RandomForestClassifier(n_estimators=100, random_state=42)
model.fit(X_train, y_train)

# Save model
joblib.dump(model, 'phishing_model.pkl')
