WITH ranked_recommendations AS (
  SELECT
    r.roommate_id,
    r.property_id,
    r.score,
    r.updated_at,
    row_number() OVER (
      PARTITION BY r.roommate_id
      ORDER BY
        r.score DESC
    ) AS rn
  FROM
    recommendations r
  ORDER BY
    r.score DESC,
    r.updated_at DESC
)
SELECT
  ranked_recommendations.property_id,
  json_agg(
    json_build_object(
      'roommate_id',
      ranked_recommendations.roommate_id,
      'score',
      ranked_recommendations.score
    )
  ) AS recommendations
FROM
  ranked_recommendations
WHERE
  (ranked_recommendations.rn <= 10)
GROUP BY
  ranked_recommendations.property_id
ORDER BY
  ranked_recommendations.property_id;