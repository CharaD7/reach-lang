module Reach.EditorInfo (printKeywordInfo) where

import qualified Data.Aeson as A
import qualified Data.Aeson.Encode.Pretty as A
import qualified Data.ByteString.Lazy.Char8 as B
import qualified Data.Map.Strict as M
import Data.Maybe
import qualified Reach.AST.SL as SL
import qualified Reach.Eval.Core as C

printKeywordInfo :: IO ()
printKeywordInfo =
  B.putStrLn $
    A.encodePretty $ infoMap

infoMap :: A.Value
infoMap =
  A.toJSON $
    M.map
      (\v -> M.fromList [("CompletionItemKind" :: String, v)])
      completionTypeMap

completionTypeMap :: M.Map String String
completionTypeMap =
  M.union
    (M.fromList $ map (\kw -> (show kw, "Keyword")) SL.allKeywords)
    ( M.map fromJust $
        M.filter isJust $
          M.fromList $
            map (\e -> (C.baseEnvName e, C.baseEnvCompletionKind e)) C.base_env_elems
    )
