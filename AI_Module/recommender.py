"""
Recommender Module - Gợi ý sản phẩm dựa trên Cosine Similarity
Kết nối trực tiếp vào Database WordPress/WooCommerce để phân tích.
"""

import pandas as pd
from sklearn.metrics.pairwise import cosine_similarity
from sklearn.feature_extraction.text import TfidfVectorizer
import pymysql
from config import DB_HOST, DB_USER, DB_PASSWORD, DB_NAME, DB_CHARSET


def get_db_connection():
    """Tạo kết nối đến MySQL (XAMPP)"""
    return pymysql.connect(
        host=DB_HOST, user=DB_USER, password=DB_PASSWORD,
        database=DB_NAME, charset=DB_CHARSET,
        cursorclass=pymysql.cursors.DictCursor
    )


def get_recommendations(product_id, top_n=5):
    """
    Gợi ý sản phẩm tương tự dựa trên:
    1. Danh mục chung (category similarity)
    2. Nội dung mô tả (TF-IDF text similarity)
    
    Trả về danh sách product IDs được gợi ý.
    """
    conn = get_db_connection()
    try:
        # Lấy tất cả sản phẩm + danh mục + mô tả
        query = """
            SELECT p.ID as id, p.post_title as title, 
                   COALESCE(p.post_excerpt, '') as description,
                   GROUP_CONCAT(DISTINCT t.name SEPARATOR ' ') as categories
            FROM wp_posts p
            LEFT JOIN wp_term_relationships tr ON p.ID = tr.object_id
            LEFT JOIN wp_term_taxonomy tt ON tr.term_taxonomy_id = tt.term_taxonomy_id
                AND tt.taxonomy = 'product_cat'
            LEFT JOIN wp_terms t ON tt.term_id = t.term_id
            WHERE p.post_type = 'product' AND p.post_status = 'publish'
            GROUP BY p.ID
        """
        df = pd.read_sql(query, conn)
    finally:
        conn.close()

    if df.empty or product_id not in df['id'].values:
        return []

    # Kết hợp categories + description thành 1 text feature
    df['features'] = df['categories'].fillna('') + ' ' + df['description'].fillna('')
    df['features'] = df['features'].str.strip()

    # Nếu tất cả features trống, fallback
    if df['features'].str.len().sum() == 0:
        other = df[df['id'] != product_id].head(top_n)
        return other['id'].tolist()

    # Tính TF-IDF similarity
    tfidf = TfidfVectorizer(stop_words=None, max_features=500)
    tfidf_matrix = tfidf.fit_transform(df['features'])
    similarity = cosine_similarity(tfidf_matrix)

    # Tìm index của sản phẩm hiện tại
    idx = df[df['id'] == product_id].index[0]
    scores = list(enumerate(similarity[idx]))
    scores = sorted(scores, key=lambda x: x[1], reverse=True)

    # Lấy top_n sản phẩm tương tự (bỏ chính nó)
    recommended_ids = []
    for i, score in scores:
        if i != idx and score > 0:
            recommended_ids.append(int(df.iloc[i]['id']))
            if len(recommended_ids) >= top_n:
                break

    return recommended_ids


if __name__ == '__main__':
    # Test nhanh
    print("Testing recommender...")
    try:
        result = get_recommendations(1, 5)
        print(f"Recommendations for product 1: {result}")
    except Exception as e:
        print(f"Error: {e}")
