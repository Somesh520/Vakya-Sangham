if(NOT TARGET fbjni::fbjni)
add_library(fbjni::fbjni SHARED IMPORTED)
set_target_properties(fbjni::fbjni PROPERTIES
    IMPORTED_LOCATION "/Users/chethanakash/.gradle/caches/8.14.1/transforms/8c0994e1ab3cd006c1dbc30296196325/transformed/jetified-fbjni-0.7.0/prefab/modules/fbjni/libs/android.armeabi-v7a/libfbjni.so"
    INTERFACE_INCLUDE_DIRECTORIES "/Users/chethanakash/.gradle/caches/8.14.1/transforms/8c0994e1ab3cd006c1dbc30296196325/transformed/jetified-fbjni-0.7.0/prefab/modules/fbjni/include"
    INTERFACE_LINK_LIBRARIES ""
)
endif()

