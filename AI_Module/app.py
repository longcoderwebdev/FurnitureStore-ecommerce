"""
FurnitureStore AI Service - Flask API Server
Cung cấp endpoint gợi ý sản phẩm cho WordPress plugin gọi sang.

Chạy: python app.py
URL: http://localhost:5000
"""

from flask import Flask, jsonify, request
from flask_cors import CORS
from recommender import get_recommendations
from config import FLASK_PORT, FLASK_DEBUG

app = Flask(__name__)
CORS(app)


@app.route('/api/health')
def health():
    """Kiểm tra trạng thái service AI"""
    return jsonify({
        'status': 'ok',
        'service': 'FurnitureStore AI Recommendation',
        'version': '1.0.0'
    })


@app.route('/api/recommend/<int:product_id>')
def recommend(product_id):
    """
    Gợi ý sản phẩm tương tự
    URL: GET /api/recommend/123?limit=5
    """
    limit = request.args.get('limit', 5, type=int)

    try:
        ids = get_recommendations(product_id, limit)
        return jsonify({
            'status': 'success',
            'product_id': product_id,
            'recommended_ids': ids,
            'count': len(ids),
            'algorithm': 'TF-IDF Cosine Similarity'
        })
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500


if __name__ == '__main__':
    print("=" * 50)
    print("FurnitureStore AI Service")
    print(f"Running on http://localhost:{FLASK_PORT}")
    print("=" * 50)
    app.run(port=FLASK_PORT, debug=FLASK_DEBUG)
