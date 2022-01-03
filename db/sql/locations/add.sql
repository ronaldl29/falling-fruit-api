WITH l AS (
  INSERT INTO locations (
    lat, lng, type_ids, user_id,
    season_start, season_stop,
    access, description, unverified,
    -- TODO: Remove once using generated column
    location
  )
  VALUES (
    ${lat}, ${lng}, ${type_ids}, ${user_id},
    ${season_start}, ${season_stop},
    ${access}, ${description}, ${unverified},
    ST_SetSrid(ST_MakePoint(${lng}, ${lat}), 4326)
  )
  RETURNING
    id, lat, lng, type_ids, user_id, import_id, author,
    created_at, updated_at,
    address, city, state, country,
    season_start, season_stop, no_season,
    access,
    description,
    muni,
    unverified,
    invasive
)
SELECT
  l.id, l.lat, l.lng, l.type_ids, l.import_id, l.user_id,
  COALESCE(l.author, u.name) as author,
  l.created_at, l.updated_at,
  l.address, l.city, l.state, l.country,
  l.season_start, l.season_stop, l.no_season,
  l.access,
  l.description,
  l.muni,
  l.unverified,
  l.invasive
FROM l
LEFT JOIN users u
  ON l.user_id = u.id
