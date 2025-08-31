if(NOT TARGET hermes-engine::libhermes)
add_library(hermes-engine::libhermes SHARED IMPORTED)
set_target_properties(hermes-engine::libhermes PROPERTIES
    IMPORTED_LOCATION "/Users/chethanakash/.gradle/caches/8.14.1/transforms/5dcbd2bc51fb870c99b763ac620a6df1/transformed/jetified-hermes-android-0.80.1-debug/prefab/modules/libhermes/libs/android.x86_64/libhermes.so"
    INTERFACE_INCLUDE_DIRECTORIES "/Users/chethanakash/.gradle/caches/8.14.1/transforms/5dcbd2bc51fb870c99b763ac620a6df1/transformed/jetified-hermes-android-0.80.1-debug/prefab/modules/libhermes/include"
    INTERFACE_LINK_LIBRARIES ""
)
endif()

